import { describe, expect, it } from "vitest";
import { generateInviteCode } from "@/lib/invite-code";

describe("generateInviteCode", () => {
  it("makes 10-char codes from the safe alphabet", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[abcdefghjkmnpqrstuvwxyz23456789]{10}$/);
  });
  it("does not repeat across many draws", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateInviteCode()));
    expect(seen.size).toBe(200);
  });
});
