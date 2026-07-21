import { describe, expect, it } from "vitest";
import { countdownParts } from "@/lib/countdown";

describe("countdownParts", () => {
  it("splits a known distance into parts", () => {
    const now = Date.parse("2027-03-30T21:58:56+01:00");
    const target = Date.parse("2027-04-02T00:00:00+01:00");
    expect(countdownParts(target, now)).toEqual({ days: 2, hours: 2, minutes: 1, seconds: 4 });
  });
  it("handles the final minute", () => {
    const target = Date.parse("2027-04-02T00:00:00+01:00");
    expect(countdownParts(target, target - 59_000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 59 });
  });
  it("returns null once the moment has passed", () => {
    const target = Date.parse("2027-04-02T00:00:00+01:00");
    expect(countdownParts(target, target)).toBeNull();
    expect(countdownParts(target, target + 1)).toBeNull();
  });
});
