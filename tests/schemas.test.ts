import { describe, expect, it } from "vitest";
import { saveTheDateSchema } from "@/lib/schemas";

const valid = { fullName: "Jordan Bennett", email: "Jordan@Example.com", status: "celebrating", guestCount: 2, note: "See you there!" };

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
  it("bounds the party size", () => {
    expect(saveTheDateSchema.safeParse({ ...valid, guestCount: 0 }).success).toBe(false);
    expect(saveTheDateSchema.safeParse({ ...valid, guestCount: 11 }).success).toBe(false);
    expect(saveTheDateSchema.safeParse({ ...valid, guestCount: "3" }).success).toBe(true);
  });
  it("rejects a blank name", () => expect(saveTheDateSchema.safeParse({ ...valid, fullName: "  " }).success).toBe(false));
});
