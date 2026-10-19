import { describe, expect, it } from "vitest";
import { itinerary, wedding } from "@/lib/content";
import { renderItineraryEmail } from "@/lib/itinerary-email";

// React escapes text, so compare against the escaped form.
const escape = (text: string) => text.replaceAll("&", "&amp;");

describe("renderItineraryEmail", () => {
  it("greets the guest by first name and lists every event", async () => {
    const html = await renderItineraryEmail({ guestName: "Bello Adeyemi" });
    expect(html).toContain("Dear Bello,");
    for (const day of itinerary.days) {
      expect(html).toContain(day.date);
      for (const event of day.events) expect(html).toContain(escape(event.title));
    }
    expect(html).toContain(itinerary.dressCode.body);
    expect(html).toContain(wedding.hashtag);
  });
  it("shows the personal note as paragraphs and falls back to a neutral greeting", async () => {
    const withNote = await renderItineraryEmail({ guestName: "  ", note: "First line\n\nSecond line" });
    expect(withNote).toContain("Dear friend,");
    expect(withNote).toContain("First line");
    expect(withNote).toContain("Second line");
    const without = await renderItineraryEmail({ guestName: "Amara" });
    expect(without).not.toContain("First line");
  });
  it("links the botanical images from the site URL", async () => {
    const html = await renderItineraryEmail({ guestName: "Amara" });
    expect(html).toContain("/email/sprigs.png");
    expect(html).toContain("/email/peony.png");
  });
});
