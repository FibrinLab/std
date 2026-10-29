// Small in-memory limiters for the chat route. On Cloudflare each isolate has its own copy, so the
// route checks the account-wide rate limiting bindings first and uses these as a second line.

export type Limiter = { allow(key: string, now?: number): boolean };

/** At most `limit` hits per key inside a sliding `windowMs` window (the window restarts when it lapses). */
export function createWindowLimiter({ limit, windowMs }: { limit: number; windowMs: number }): Limiter {
  const hits = new Map<string, { count: number; reset: number }>();
  return {
    allow(key, now = Date.now()) {
      // Drop lapsed entries now and then so the map never grows without bound.
      if (hits.size > 5000) for (const [k, item] of hits) if (item.reset < now) hits.delete(k);
      const item = hits.get(key);
      if (!item || item.reset < now) { hits.set(key, { count: 1, reset: now + windowMs }); return true; }
      if (item.count >= limit) return false;
      item.count++;
      return true;
    },
  };
}

/** At most `limit` hits per UTC calendar day, across every key. */
export function createDailyCap(limit: number): Limiter {
  let day = "";
  let count = 0;
  return {
    allow(_key, now = Date.now()) {
      const today = new Date(now).toISOString().slice(0, 10);
      if (today !== day) { day = today; count = 0; }
      if (count >= limit) return false;
      count++;
      return true;
    },
  };
}

/** A Cloudflare rate limiting binding (wrangler.jsonc → ratelimits), typed structurally so no Workers types are needed. */
export type CloudflareRateLimiter = { limit(options: { key: string }): Promise<{ success: boolean }> };
export const isCloudflareRateLimiter = (value: unknown): value is CloudflareRateLimiter => typeof value === "object" && value !== null && typeof (value as { limit?: unknown }).limit === "function";
