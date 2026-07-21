import { beforeAll, describe, expect, it } from "vitest";

process.env.ADMIN_PASSWORD = "correct-horse-battery";
let security: typeof import("@/lib/security");
beforeAll(async () => { security = await import("@/lib/security"); });

describe("admin sessions", () => {
  it("round-trips a valid session token", () => {
    const token = security.createSessionToken("correct-horse-battery");
    expect(security.verifySessionToken(token, "correct-horse-battery")).toBe(true);
  });
  it("rejects an expired token", () => {
    const past = Date.now() - 40 * 24 * 60 * 60 * 1000;
    const token = security.createSessionToken("correct-horse-battery", past);
    expect(security.verifySessionToken(token, "correct-horse-battery", Date.now())).toBe(false);
  });
  it("rejects a tampered token", () => {
    const token = security.createSessionToken("correct-horse-battery");
    const [expires, mac] = token.split(".");
    expect(security.verifySessionToken(`${Number(expires) + 1000}.${mac}`, "correct-horse-battery")).toBe(false);
    expect(security.verifySessionToken(`${expires}.${mac}x`, "correct-horse-battery")).toBe(false);
    expect(security.verifySessionToken("garbage", "correct-horse-battery")).toBe(false);
  });
  it("invalidates sessions when the password changes", () => {
    const token = security.createSessionToken("correct-horse-battery");
    expect(security.verifySessionToken(token, "a-different-password")).toBe(false);
  });
});

describe("password check", () => {
  it("accepts the configured password and rejects others", () => {
    expect(security.verifyPassword("correct-horse-battery", "correct-horse-battery")).toBe(true);
    expect(security.verifyPassword("wrong", "correct-horse-battery")).toBe(false);
    expect(security.verifyPassword("anything", undefined)).toBe(false);
  });
});
