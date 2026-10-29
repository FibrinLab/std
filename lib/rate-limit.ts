// Rate limiting for the chat route. The counting rules live in pure functions so the same logic runs in three
// places: the ChatLimiter Durable Object on Cloudflare (strict, one counter for the whole world), the in-memory
// limiters below (per isolate — the fallback for `next dev`), and the vitest suite.

export type SlidingRule = { limit: number; windowMs: number };

/**
 * Sliding-window count: `hits` is the list of hit timestamps still inside the window. Returns whether this hit
 * is allowed, the pruned list to store, and how long until the oldest hit falls out of the window.
 */
export function takeSliding(hits: readonly number[], { limit, windowMs }: SlidingRule, now: number): { allowed: boolean; hits: number[]; retryAfterMs: number } {
  const live = hits.filter((at) => at > now - windowMs);
  if (live.length >= limit) return { allowed: false, hits: live, retryAfterMs: Math.max(0, live[0] + windowMs - now) };
  live.push(now);
  return { allowed: true, hits: live, retryAfterMs: 0 };
}

export type DailyState = { day: string; count: number };

/** The UTC calendar day a timestamp falls on, e.g. "2027-05-01". */
export const utcDay = (now: number) => new Date(now).toISOString().slice(0, 10);

/** Start of the next UTC day — when a daily counter resets. */
export const nextUtcMidnight = (now: number) => Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate() + 1);

/** Per-UTC-day count across every caller. A state from an earlier day starts over at zero. */
export function takeDaily(state: DailyState | undefined, limit: number, now: number): { allowed: boolean; state: DailyState } {
  const day = utcDay(now);
  const count = state?.day === day ? state.count : 0;
  if (count >= limit) return { allowed: false, state: { day, count } };
  return { allowed: true, state: { day, count: count + 1 } };
}

export type Limiter = { allow(key: string, now?: number): boolean };

/** In-memory sliding window per key: at most `limit` hits inside any `windowMs` span. */
export function createWindowLimiter(rule: SlidingRule): Limiter {
  const hits = new Map<string, number[]>();
  return {
    allow(key, now = Date.now()) {
      // Drop lapsed entries now and then so the map never grows without bound.
      if (hits.size > 5000) for (const [k, item] of hits) if (item.every((at) => at <= now - rule.windowMs)) hits.delete(k);
      const result = takeSliding(hits.get(key) ?? [], rule, now);
      hits.set(key, result.hits);
      return result.allowed;
    },
  };
}

/** In-memory cap of `limit` hits per UTC calendar day, across every key. */
export function createDailyCap(limit: number): Limiter {
  let state: DailyState | undefined;
  return {
    allow(_key, now = Date.now()) {
      const result = takeDaily(state, limit, now);
      state = result.state;
      return result.allowed;
    },
  };
}

/** A Cloudflare rate limiting binding (wrangler.jsonc → ratelimits), typed structurally so no Workers types are needed. */
export type CloudflareRateLimiter = { limit(options: { key: string }): Promise<{ success: boolean }> };
export const isCloudflareRateLimiter = (value: unknown): value is CloudflareRateLimiter => typeof value === "object" && value !== null && typeof (value as { limit?: unknown }).limit === "function";
