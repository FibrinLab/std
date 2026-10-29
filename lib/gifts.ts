import { gifts, type Gift } from "./content";
import type { GiftClaim } from "./types";

// Pure helpers shared by the /gifts page, the reserve route, the admin view and the tests.
// A gift is "available" while fewer reservations exist than the quantity wanted.

export const giftQuantity = (gift: Gift) => Math.max(1, gift.quantity ?? 1);

export const findGift = (id: string): Gift | undefined => gifts.items.find((gift) => gift.id === id);

export type GiftAvailability = { quantity: number; claimed: number; left: number };

/** Availability of one gift given every reservation so far (reservations for other gifts are ignored). */
export function availabilityFor(gift: Gift, claims: ReadonlyArray<Pick<GiftClaim, "giftId">>): GiftAvailability {
  const quantity = giftQuantity(gift);
  const claimed = claims.filter((claim) => claim.giftId === gift.id).length;
  return { quantity, claimed, left: Math.max(0, quantity - claimed) };
}

/** Availability of every gift on the list, keyed by gift id. */
export function giftAvailability(claims: ReadonlyArray<Pick<GiftClaim, "giftId">>): Record<string, GiftAvailability> {
  return Object.fromEntries(gifts.items.map((gift) => [gift.id, availabilityFor(gift, claims)]));
}

/** Where "Buy on Amazon" goes: the gift's own link, else the registry; null while neither is set yet. */
export const buyHref = (gift: Gift): string | null => gift.href || gifts.registry.href || null;
