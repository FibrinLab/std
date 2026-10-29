import { describe, expect, it } from "vitest";
import { gifts } from "@/lib/content";
import { deleteDemoGiftClaim, listDemoGiftClaims, saveDemoGiftClaim } from "@/lib/demo-store";
import { availabilityFor, buyHref, findGift, giftAvailability, giftQuantity } from "@/lib/gifts";
import { renderGiftAlertEmail } from "@/lib/email";
import { giftReserveSchema } from "@/lib/schemas";

const claim = (giftId: string) => ({ giftId });

describe("gift availability", () => {
  it("counts reservations per gift against the quantity wanted", () => {
    const single = { id: "a", name: "A", note: "", price: "£1", category: "x" };
    const pair = { ...single, id: "b", quantity: 2 };
    expect(availabilityFor(single, [])).toEqual({ quantity: 1, claimed: 0, left: 1 });
    expect(availabilityFor(single, [claim("a"), claim("b")])).toEqual({ quantity: 1, claimed: 1, left: 0 });
    expect(availabilityFor(pair, [claim("b")])).toEqual({ quantity: 2, claimed: 1, left: 1 });
    expect(availabilityFor(pair, [claim("b"), claim("b"), claim("b")]).left).toBe(0);
  });
  it("treats a missing or silly quantity as one", () => {
    expect(giftQuantity({ id: "a", name: "A", note: "", price: "£1", category: "x" })).toBe(1);
    expect(giftQuantity({ id: "a", name: "A", note: "", price: "£1", category: "x", quantity: 0 })).toBe(1);
  });
  it("covers every gift on the list, with ids kept unique", () => {
    const map = giftAvailability([]);
    expect(Object.keys(map).sort()).toEqual(gifts.items.map((gift) => gift.id).sort());
    expect(new Set(gifts.items.map((gift) => gift.id)).size).toBe(gifts.items.length);
    expect(findGift(gifts.items[0].id)?.name).toBe(gifts.items[0].name);
    expect(findGift("not-a-gift")).toBeUndefined();
  });
  it("sends guests to the gift's own link, then the registry, and nowhere while neither is set", () => {
    const gift = { id: "a", name: "A", note: "", price: "£1", category: "x" };
    expect(buyHref({ ...gift, href: "https://www.amazon.co.uk/dp/EXAMPLE" })).toBe("https://www.amazon.co.uk/dp/EXAMPLE");
    expect(buyHref(gift)).toBe(gifts.registry.href || null);
  });
});

describe("giftReserveSchema", () => {
  it("accepts a name alone and lowercases an email when one is given", () => {
    expect(giftReserveSchema.safeParse({ giftId: "dinner-set", guestName: "Ada Eze" })).toMatchObject({ success: true, data: { email: "", message: "" } });
    const parsed = giftReserveSchema.safeParse({ giftId: "dinner-set", guestName: "Ada Eze", email: "Ada@Example.com", message: "Hi" });
    expect(parsed.success && parsed.data.email).toBe("ada@example.com");
  });
  it("rejects a blank name, a bad email and an essay", () => {
    expect(giftReserveSchema.safeParse({ giftId: "dinner-set", guestName: " " }).success).toBe(false);
    expect(giftReserveSchema.safeParse({ giftId: "dinner-set", guestName: "Ada", email: "nope" }).success).toBe(false);
    expect(giftReserveSchema.safeParse({ giftId: "dinner-set", guestName: "Ada", message: "x".repeat(301) }).success).toBe(false);
  });
});

describe("demo gift claims", () => {
  it("stores, lists newest first and releases reservations", () => {
    const before = listDemoGiftClaims().length;
    const saved = saveDemoGiftClaim({ giftId: "stand-mixer", guestName: "Sam Rivers", email: "", message: "" });
    expect(saved.id).toBeTruthy();
    const listed = listDemoGiftClaims();
    expect(listed.length).toBe(before + 1);
    expect(listed[0].id).toBe(saved.id);
    expect(giftAvailability(listed)["stand-mixer"].left).toBe(0);
    expect(deleteDemoGiftClaim(saved.id)).toBe(true);
    expect(deleteDemoGiftClaim(saved.id)).toBe(false);
    expect(giftAvailability(listDemoGiftClaims())["stand-mixer"].left).toBe(1);
  });
});

describe("renderGiftAlertEmail", () => {
  const gift = { id: "bed-linen", name: "Egyptian cotton bed linen set", note: "", price: "£120", category: "Bedroom", quantity: 2 };
  const claim = { id: "c1", giftId: "bed-linen", guestName: "Ada Eze", email: "ada@example.com", message: "With love from Abuja", createdAt: "2027-01-01T10:00:00.000Z" };
  it("names the guest and the gift, quotes the note and says what is left", async () => {
    const html = await renderGiftAlertEmail({ claim, gift, availability: { quantity: 2, claimed: 1, left: 1 } });
    expect(html).toContain("Ada Eze reserved Egyptian cotton bed linen set");
    expect(html).toContain("With love from Abuja");
    expect(html).toContain("ada@example.com");
    expect(html).toContain("1 of 2 still open");
    expect(html).toContain("/admin/gifts");
  });
  it("copes without an email or note and says when a gift is fully reserved", async () => {
    const html = await renderGiftAlertEmail({ claim: { ...claim, email: "", message: "" }, gift: { ...gift, quantity: 1 }, availability: { quantity: 1, claimed: 1, left: 0 } });
    expect(html).toContain("did not leave an email");
    expect(html).toContain("now marked as reserved");
    expect(html).not.toContain("With love");
  });
});
