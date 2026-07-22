import { describe, expect, it } from "vitest";
import { saveTheDateSchema } from "@/lib/schemas";

const valid = { fullName: "Jordan Bennett", email: "Jordan@Example.com", status: "celebrating", guestCount: 2, guestNames: ["Taylor Bennett"], note: "See you there!" };

describe("saveTheDateSchema", () => {
  it("accepts a complete reply and lowercases the email", () => {
    const parsed = saveTheDateSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.email).toBe("jordan@example.com");
  });
  it("defaults the note", () => {
    const parsed = saveTheDateSchema.safeParse({ ...valid, note: undefined });
    expect(parsed.success && parsed.data.note).toBe("");
  });
  it("rejects an invalid email", () => expect(saveTheDateSchema.safeParse({ ...valid, email: "bad" }).success).toBe(false));
  it("rejects an unknown status", () => expect(saveTheDateSchema.safeParse({ ...valid, status: "maybe" }).success).toBe(false));
  it("bounds the party size at 2", () => {
    expect(saveTheDateSchema.safeParse({ ...valid, guestCount: 0, guestNames: [] }).success).toBe(false);
    expect(saveTheDateSchema.safeParse({ ...valid, guestCount: 3, guestNames: ["Ada", "Tunde"] }).success).toBe(false);
    expect(saveTheDateSchema.safeParse({ ...valid, guestCount: "2" }).success).toBe(true);
  });
  it("rejects a blank name", () => expect(saveTheDateSchema.safeParse({ ...valid, fullName: "  " }).success).toBe(false));
  it("accepts an optional invite code", () => {
    expect(saveTheDateSchema.safeParse({ ...valid, inviteCode: "abcd234xyz" }).success).toBe(true);
    expect(saveTheDateSchema.safeParse({ ...valid, inviteCode: "" }).success).toBe(false);
  });
  it("requires one guest name per additional guest", () => {
    expect(saveTheDateSchema.safeParse({ ...valid, guestNames: [] }).success).toBe(false);
    expect(saveTheDateSchema.safeParse({ ...valid, guestCount: 1, guestNames: [] }).success).toBe(true);
    expect(saveTheDateSchema.safeParse({ ...valid, guestNames: [" "] }).success).toBe(false);
  });
  it("forbids guest names when celebrating from afar", () => {
    expect(saveTheDateSchema.safeParse({ ...valid, status: "from_afar", guestCount: 1 }).success).toBe(false);
    expect(saveTheDateSchema.safeParse({ ...valid, status: "from_afar", guestCount: 1, guestNames: [] }).success).toBe(true);
  });
});
