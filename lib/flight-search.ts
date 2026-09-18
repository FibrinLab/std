import { airportLabel, airports, type Airport } from "@/lib/airports";

// Builds links into flight-search sites. The wedding site never sells tickets or shows prices —
// it only hands the guest's search over to a comparison site in a new tab.

export const DESTINATION = "LOS";
export const cabins = [
  { value: "economy", label: "Economy" },
  { value: "premium", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
] as const;
export type Cabin = typeof cabins[number]["value"];

export type FlightSearch = {
  from: string; // whatever the guest typed or picked
  depart: string; // YYYY-MM-DD
  return: string; // YYYY-MM-DD
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
};

const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export function suggestAirports(text: string, limit = 7): Airport[] {
  const query = fold(text);
  if (!query) return [];
  const score = (airport: Airport) => {
    if (fold(airport.code) === query) return 0;
    if (fold(airport.city).startsWith(query)) return 1;
    if (fold(airport.name).startsWith(query) || fold(airport.country).startsWith(query)) return 2;
    if (fold(airportLabel(airport)).includes(query)) return 3;
    return -1;
  };
  return airports.map((airport, index) => ({ airport, index, rank: score(airport) })).filter((entry) => entry.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.index - b.index).slice(0, limit).map((entry) => entry.airport);
}

// Resolves free text to one airport: a picked label, a bare code, or a city name (first listing wins,
// which is the "All airports" entry where a city has one). Anything else returns null.
export function matchAirport(text: string): Airport | null {
  const query = fold(text);
  if (!query) return null;
  const inParens = /\(([a-z]{3})\)\s*$/.exec(query)?.[1];
  return airports.find((airport) => fold(airport.code) === (inParens ?? query))
    ?? airports.find((airport) => fold(airport.city) === query || fold(airportLabel(airport)) === query)
    ?? null;
}

export function validateSearch(search: FlightSearch): string | null {
  if (!search.from.trim()) return "Please tell us where you’re flying from.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(search.depart) || !/^\d{4}-\d{2}-\d{2}$/.test(search.return)) return "Please choose both a departure and a return date.";
  if (search.return < search.depart) return "Your return date is before your departure date.";
  if (search.infants > search.adults) return "Each infant needs to travel with an adult.";
  return null;
}

// Skyscanner asks for each child's age: we send 8 for a child and 1 for an infant (under two).
export function buildSkyscannerUrl(search: FlightSearch, origin: Airport) {
  const compact = (date: string) => date.slice(2).replaceAll("-", "");
  const skyCabin: Record<Cabin, string> = { economy: "economy", premium: "premiumeconomy", business: "business", first: "first" };
  const params = new URLSearchParams({ adultsv2: String(search.adults), cabinclass: skyCabin[search.cabin], rtn: "1" });
  const ages = [...Array<string>(search.children).fill("8"), ...Array<string>(search.infants).fill("1")];
  if (ages.length) params.set("childrenv2", ages.join("|"));
  return `https://www.skyscanner.net/transport/flights/${(origin.sky ?? origin.code).toLowerCase()}/${DESTINATION.toLowerCase()}/${compact(search.depart)}/${compact(search.return)}/?${params}`;
}

// Kayak: /flights/LON-LOS/2027-03-30/2027-04-05/business/2adults/children-11-1L (11 = child, 1L = infant on lap).
export function buildKayakUrl(search: FlightSearch, origin: Airport) {
  const parts = [`${origin.code}-${DESTINATION}`, search.depart, search.return];
  if (search.cabin !== "economy") parts.push(search.cabin);
  parts.push(`${search.adults}adults`);
  const young = [...Array<string>(search.children).fill("11"), ...Array<string>(search.infants).fill("1L")];
  if (young.length) parts.push(`children-${young.join("-")}`);
  return `https://www.kayak.co.uk/flights/${parts.join("/")}`;
}

// Google Flights has no documented link format, but it understands a plain-English query —
// which also makes it the fallback when we can't match what the guest typed to an airport.
export function buildGoogleFlightsUrl(search: FlightSearch, origin: Airport | null) {
  const cabinPhrase: Record<Cabin, string> = { economy: "", premium: " premium economy", business: " business class", first: " first class" };
  const phrase = `Flights to ${DESTINATION} from ${origin?.code ?? search.from.trim()} on ${search.depart} through ${search.return}${cabinPhrase[search.cabin]}`;
  return `https://www.google.com/travel/flights?${new URLSearchParams({ q: phrase })}`;
}

export function buildSearchLinks(search: FlightSearch) {
  const origin = matchAirport(search.from);
  return {
    origin,
    primary: origin ? buildSkyscannerUrl(search, origin) : buildGoogleFlightsUrl(search, null),
    primarySite: origin ? "Skyscanner" : "Google Flights",
    google: buildGoogleFlightsUrl(search, origin),
    kayak: origin ? buildKayakUrl(search, origin) : null,
  };
}
