import { describe, expect, it } from "vitest";
import { parseCustomRecipients } from "@/app/admin/(protected)/audience-picker";

describe("parseCustomRecipients", () => {
  it("accepts bare addresses and Name <email> lines, lowercased and de-duplicated", () => {
    const { recipients, invalid } = parseCustomRecipients("Bello Adeyemi <Bello@Example.com>\nfunmi@example.com, bello@example.com\n\n");
    expect(recipients).toEqual([{ email: "bello@example.com", fullName: "Bello Adeyemi" }, { email: "funmi@example.com", fullName: "" }]);
    expect(invalid).toEqual([]);
  });
  it("reports lines that are not addresses", () => {
    const { recipients, invalid } = parseCustomRecipients("not an email\nok@example.com");
    expect(recipients).toHaveLength(1);
    expect(invalid).toEqual(["not an email"]);
  });
});
