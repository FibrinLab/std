import { describe, expect, it } from "vitest";
import { createDailyCap, createWindowLimiter, isCloudflareRateLimiter, nextUtcMidnight, takeDaily, takeSliding, utcDay } from "@/lib/rate-limit";

describe("createWindowLimiter", () => {
  it("allows up to the limit per key, then refuses until the window lapses", () => {
    const limiter = createWindowLimiter({ limit: 3, windowMs: 1000 });
    const start = 1_000_000;
    expect([limiter.allow("a", start), limiter.allow("a", start + 10), limiter.allow("a", start + 20)]).toEqual([true, true, true]);
    expect(limiter.allow("a", start + 30)).toBe(false);
    expect(limiter.allow("b", start + 30)).toBe(true);
    expect(limiter.allow("a", start + 999)).toBe(false);
    expect(limiter.allow("a", start + 1001)).toBe(true);
  });
});

describe("createDailyCap", () => {
  it("counts every key together and resets at the next UTC day", () => {
    const cap = createDailyCap(2);
    const noon = Date.UTC(2027, 0, 1, 12);
    expect(cap.allow("a", noon)).toBe(true);
    expect(cap.allow("b", noon + 1)).toBe(true);
    expect(cap.allow("c", noon + 2)).toBe(false);
    expect(cap.allow("c", Date.UTC(2027, 0, 2, 0, 0, 1))).toBe(true);
  });
});

describe("isCloudflareRateLimiter", () => {
  it("recognises a binding by its limit() method", () => {
    expect(isCloudflareRateLimiter({ limit: async () => ({ success: true }) })).toBe(true);
    expect(isCloudflareRateLimiter(undefined)).toBe(false);
    expect(isCloudflareRateLimiter("CHAT_RATE_LIMIT")).toBe(false);
  });
});

describe("takeSliding", () => {
  const rule = { limit: 3, windowMs: 10_000 };
  it("allows up to the limit inside any window and says how long until a slot frees", () => {
    const t = 1_000_000;
    let hits: number[] = [];
    for (const at of [t, t + 1000, t + 2000]) {
      const result = takeSliding(hits, rule, at);
      expect(result.allowed).toBe(true);
      hits = result.hits;
    }
    const refused = takeSliding(hits, rule, t + 3000);
    expect(refused.allowed).toBe(false);
    expect(refused.hits).toEqual([t, t + 1000, t + 2000]);
    expect(refused.retryAfterMs).toBe(7000);
  });
  it("slides: a slot frees as soon as the oldest hit leaves the window, not when the window restarts", () => {
    const t = 1_000_000;
    const full = [t, t + 1000, t + 2000];
    expect(takeSliding(full, rule, t + 9999).allowed).toBe(false);
    const result = takeSliding(full, rule, t + 10_001);
    expect(result.allowed).toBe(true);
    expect(result.hits).toEqual([t + 1000, t + 2000, t + 10_001]);
    // The second hit still blocks until it is older than the window too.
    expect(takeSliding(result.hits, rule, t + 10_500).allowed).toBe(false);
    expect(takeSliding(result.hits, rule, t + 11_001).allowed).toBe(true);
  });
  it("prunes lapsed hits from the stored list", () => {
    expect(takeSliding([1, 2, 3], rule, 50_000).hits).toEqual([50_000]);
  });
});

describe("takeDaily", () => {
  it("counts from zero, refuses at the limit and starts over on the next UTC day", () => {
    const noon = Date.UTC(2027, 0, 1, 12);
    const first = takeDaily(undefined, 2, noon);
    expect(first).toEqual({ allowed: true, state: { day: "2027-01-01", count: 1 } });
    const second = takeDaily(first.state, 2, noon + 1);
    expect(second.allowed).toBe(true);
    const third = takeDaily(second.state, 2, noon + 2);
    expect(third).toEqual({ allowed: false, state: { day: "2027-01-01", count: 2 } });
    expect(takeDaily(third.state, 2, Date.UTC(2027, 0, 2, 0, 0, 1))).toEqual({ allowed: true, state: { day: "2027-01-02", count: 1 } });
  });
  it("treats a stale state from an earlier day as empty", () => {
    expect(takeDaily({ day: "2026-12-31", count: 1999 }, 2000, Date.UTC(2027, 0, 1)).state).toEqual({ day: "2027-01-01", count: 1 });
  });
});

describe("utc day helpers", () => {
  it("names the UTC day and finds the next midnight", () => {
    const late = Date.UTC(2027, 4, 1, 23, 59, 59);
    expect(utcDay(late)).toBe("2027-05-01");
    expect(nextUtcMidnight(late)).toBe(Date.UTC(2027, 4, 2));
    expect(nextUtcMidnight(Date.UTC(2027, 11, 31, 1))).toBe(Date.UTC(2028, 0, 1));
  });
});
