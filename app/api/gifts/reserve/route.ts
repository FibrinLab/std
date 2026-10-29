import { NextResponse } from "next/server";
import { gifts } from "@/lib/content";
import { availabilityFor, findGift, giftAvailability } from "@/lib/gifts";
import { createWindowLimiter } from "@/lib/rate-limit";
import { listGiftClaims, saveGiftClaim } from "@/lib/repository";
import { giftReserveSchema } from "@/lib/schemas";

// A guest reserves a gift from the list. The name is only ever shown in the admin; the public page
// shows just "Reserved". Reservations are checked against the quantity wanted before they are saved.

const perIp = createWindowLimiter({ limit: 10, windowMs: 60_000 });
const clientIp = (request: Request) => request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

export async function POST(request: Request) {
  if (!perIp.allow(clientIp(request))) return NextResponse.json({ error: "Too many reservations from this connection. Please wait a minute." }, { status: 429 });
  const parsed = giftReserveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your name (and email, if you added one), then try again." }, { status: 400 });
  const gift = findGift(parsed.data.giftId);
  if (!gift) return NextResponse.json({ error: "That gift is no longer on the list." }, { status: 404 });
  try {
    const claims = await listGiftClaims();
    if (availabilityFor(gift, claims).left === 0) return NextResponse.json({ error: gifts.reserve.busy, availability: giftAvailability(claims) }, { status: 409 });
    const claim = await saveGiftClaim(parsed.data);
    return NextResponse.json({ ok: true, giftId: claim.giftId, availability: giftAvailability([...claims, claim]) });
  } catch (error) {
    console.error("Gift reservation failed", error);
    return NextResponse.json({ error: "We could not save your reservation. Please try again." }, { status: 500 });
  }
}
