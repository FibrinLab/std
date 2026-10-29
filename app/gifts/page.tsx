import type { Metadata } from "next";
import { GiftsPage } from "@/components/gifts-page";
import { gifts, wedding } from "@/lib/content";
import { giftAvailability } from "@/lib/gifts";
import { listGiftClaims } from "@/lib/repository";

// Which gifts are already reserved changes as guests reserve them, so the page renders per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: gifts.title,
  description: `Gift list for ${wedding.coupleNames}’s wedding on ${wedding.dateLong}: reserve a gift and buy it through the couple’s Amazon registry.`,
};

export default async function Page() {
  const availability = giftAvailability(await listGiftClaims());
  return <GiftsPage availability={availability}/>;
}
