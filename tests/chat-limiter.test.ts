import { describe, expect, it } from "vitest";
import { CHAT_LIMITS, ChatLimiter, durableObjectAllows, isChatLimiterNamespace } from "@/lib/chat-limiter";

// The Durable Object runs here against an in-memory stand-in for its storage, so the request protocol and the
// alarm bookkeeping are covered without workerd. The counting rules themselves are tested in rate-limit.test.ts.

function fakeState() {
  const data = new Map<string, unknown>();
  let alarm: number | null = null;
  const storage = {
    async get<T>(key: string) { return data.get(key) as T | undefined; },
    async put(key: string, value: unknown) { data.set(key, value); },
    async deleteAll() { data.clear(); },
    async setAlarm(time: number) { alarm = time; },
  };
  return { state: { storage }, data, alarm: () => alarm };
}

const take = (limiter: ChatLimiter, rule: "ip" | "day") => limiter.fetch(new Request(`https://chat-limiter/take/${rule}`, { method: "POST" }));

describe("ChatLimiter", () => {
  it("allows 20 hits per IP then answers 429 with a retry hint, and schedules a clean-up alarm", async () => {
    const { state, alarm } = fakeState();
    const limiter = new ChatLimiter(state);
    const before = Date.now();
    for (let i = 0; i < CHAT_LIMITS.perIp.limit; i++) expect((await take(limiter, "ip")).status).toBe(200);
    const refused = await take(limiter, "ip");
    expect(refused.status).toBe(429);
    const body = (await refused.json()) as { allowed: boolean; retryAfterMs: number };
    expect(body.allowed).toBe(false);
    expect(body.retryAfterMs).toBeGreaterThan(CHAT_LIMITS.perIp.windowMs - 5000);
    expect(alarm()).toBeGreaterThanOrEqual(before + CHAT_LIMITS.perIp.windowMs);
  });

  it("keeps the day counter separately and empties its storage when the alarm fires", async () => {
    const { state, data } = fakeState();
    const limiter = new ChatLimiter(state);
    expect((await take(limiter, "day")).status).toBe(200);
    expect((await take(limiter, "day")).status).toBe(200);
    expect((data.get("day") as { count: number }).count).toBe(2);
    await limiter.alarm();
    expect(data.size).toBe(0);
    expect((await take(limiter, "day")).status).toBe(200);
    expect((data.get("day") as { count: number }).count).toBe(1);
  });

  it("answers 404 to anything but POST /take/ip or /take/day", async () => {
    const limiter = new ChatLimiter(fakeState().state);
    expect((await limiter.fetch(new Request("https://chat-limiter/take/ip"))).status).toBe(404);
    expect((await limiter.fetch(new Request("https://chat-limiter/other", { method: "POST" }))).status).toBe(404);
  });
});

describe("durableObjectAllows", () => {
  // A namespace stand-in that routes each id to its own ChatLimiter, like the real binding does.
  function fakeNamespace() {
    const objects = new Map<string, ChatLimiter>();
    const asked: string[] = [];
    const namespace = {
      idFromName: (name: string) => name,
      get: (id: unknown) => {
        const name = String(id);
        asked.push(name);
        if (!objects.has(name)) objects.set(name, new ChatLimiter(fakeState().state));
        return { fetch: (input: string, init?: RequestInit) => objects.get(name)!.fetch(new Request(input, init)) };
      },
    };
    return { namespace, asked };
  }

  it("asks the guest's own object and then the shared day counter", async () => {
    const { namespace, asked } = fakeNamespace();
    expect(await durableObjectAllows(namespace, "203.0.113.9")).toBe(true);
    expect(asked).toEqual(["ip:203.0.113.9", "everyone"]);
  });

  it("refuses the 21st question from one IP without touching the day counter, while another IP still gets through", async () => {
    const { namespace, asked } = fakeNamespace();
    for (let i = 0; i < 20; i++) expect(await durableObjectAllows(namespace, "a")).toBe(true);
    asked.length = 0;
    expect(await durableObjectAllows(namespace, "a")).toBe(false);
    expect(asked).toEqual(["ip:a"]);
    expect(await durableObjectAllows(namespace, "b")).toBe(true);
  });

  it("throws on an unexpected answer so the route can fall back", async () => {
    const broken = { idFromName: (name: string) => name, get: () => ({ fetch: async () => new Response("boom", { status: 500 }) }) };
    await expect(durableObjectAllows(broken, "a")).rejects.toThrow("500");
  });

  it("recognises the binding by its idFromName and get methods", () => {
    expect(isChatLimiterNamespace(fakeNamespace().namespace)).toBe(true);
    expect(isChatLimiterNamespace({ limit: async () => ({ success: true }) })).toBe(false);
    expect(isChatLimiterNamespace(undefined)).toBe(false);
  });
});
