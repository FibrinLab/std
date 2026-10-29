import { nextUtcMidnight, takeDaily, takeSliding } from "@/lib/rate-limit";

// ChatLimiter is a Cloudflare Durable Object: a single-threaded object with its own storage that every one of
// Cloudflare's servers talks to, so its counts are exact where the `ratelimits` bindings are only approximate.
// The chat route uses one object per guest IP (sliding 20 per 10 minutes) and one shared object for the whole
// site (2000 per UTC day). It is exported from worker.ts and bound in wrangler.jsonc as CHAT_LIMITER.
//
// Types are structural (the subset of the Workers API the class touches) so the Next.js typecheck needs no
// Cloudflare type package; the object speaks plain HTTP (`stub.fetch`) rather than RPC for the same reason.

export const CHAT_LIMITS = {
  /** Questions one guest may ask inside any ten-minute span. */
  perIp: { limit: 20, windowMs: 10 * 60 * 1000 },
  /** Questions the whole site answers per UTC day — the cost ceiling. */
  perDay: 2000,
} as const;

export type LimitRule = "ip" | "day";

type DurableStorage = {
  get<T>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
  deleteAll(): Promise<void>;
  setAlarm(scheduledTime: number): Promise<void>;
};
type DurableState = { storage: DurableStorage };

export class ChatLimiter {
  constructor(private readonly state: DurableState) {}

  /** POST /take/ip or /take/day → 200 when the hit is allowed, 429 when the limit is reached. */
  async fetch(request: Request): Promise<Response> {
    const rule = request.url.endsWith("/take/ip") ? "ip" : request.url.endsWith("/take/day") ? "day" : null;
    if (request.method !== "POST" || !rule) return new Response("Not found", { status: 404 });
    const { storage } = this.state;
    const now = Date.now();
    if (rule === "ip") {
      const result = takeSliding((await storage.get<number[]>("hits")) ?? [], CHAT_LIMITS.perIp, now);
      await storage.put("hits", result.hits);
      // Once the window has passed with no new hits the object has nothing left to remember.
      await storage.setAlarm(now + CHAT_LIMITS.perIp.windowMs);
      return Response.json({ allowed: result.allowed, retryAfterMs: result.retryAfterMs }, { status: result.allowed ? 200 : 429 });
    }
    const result = takeDaily(await storage.get("day"), CHAT_LIMITS.perDay, now);
    await storage.put("day", result.state);
    await storage.setAlarm(nextUtcMidnight(now));
    return Response.json({ allowed: result.allowed, retryAfterMs: result.allowed ? 0 : nextUtcMidnight(now) - now }, { status: result.allowed ? 200 : 429 });
  }

  /** Alarms fire when the current window or day is over: clear the storage so idle objects cost nothing. */
  async alarm(): Promise<void> {
    await this.state.storage.deleteAll();
  }
}

/** The `durable_objects` binding as the route sees it on `getCloudflareContext().env`. */
export type ChatLimiterNamespace = { idFromName(name: string): unknown; get(id: unknown): { fetch(input: string, init?: RequestInit): Promise<Response> } };
export const isChatLimiterNamespace = (value: unknown): value is ChatLimiterNamespace =>
  typeof value === "object" && value !== null && typeof (value as { idFromName?: unknown }).idFromName === "function" && typeof (value as { get?: unknown }).get === "function";

/** Ask the Durable Object whether this hit is allowed: the guest's own object first, then the site-wide day counter. */
export async function durableObjectAllows(limiter: ChatLimiterNamespace, ip: string): Promise<boolean> {
  const checks: Array<[name: string, rule: LimitRule]> = [[`ip:${ip}`, "ip"], ["everyone", "day"]];
  for (const [name, rule] of checks) {
    const response = await limiter.get(limiter.idFromName(name)).fetch(`https://chat-limiter/take/${rule}`, { method: "POST" });
    if (response.status === 429) return false;
    if (!response.ok) throw new Error(`ChatLimiter answered ${response.status}`);
  }
  return true;
}
