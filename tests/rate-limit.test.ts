import { describe, expect, it } from "vitest";
import { createDailyCap, createWindowLimiter, isCloudflareRateLimiter } from "@/lib/rate-limit";

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
