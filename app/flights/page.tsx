import type { Metadata } from "next";
import { FlightsPage } from "@/components/flights-page";
import { flights, wedding } from "@/lib/content";

export const metadata: Metadata = {
  title: flights.title,
  description: `Travel details for ${wedding.coupleNames}’s wedding in Lagos on ${wedding.dateLong}: which airport to fly into, suggested dates and a flight search.`,
};

export default function Page() {
  return <FlightsPage/>;
}
