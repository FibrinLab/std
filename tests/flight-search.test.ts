import { describe, expect, it } from "vitest";
import { buildGoogleFlightsUrl, buildKayakUrl, buildSearchLinks, buildSkyscannerUrl, matchAirport, suggestAirports, validateSearch, type FlightSearch } from "@/lib/flight-search";

const base: FlightSearch = { from: "London", depart: "2027-03-30", return: "2027-04-05", adults: 1, children: 0, infants: 0, cabin: "economy" };

describe("matchAirport", () => {
  it("resolves cities, codes and picked labels", () => {
    expect(matchAirport("london")?.code).toBe("LON");
    expect(matchAirport(" man ")?.code).toBe("MAN");
    expect(matchAirport("Vienna (VIE)")?.code).toBe("VIE");
    expect(matchAirport("London — Heathrow (LHR)")?.code).toBe("LHR");
    expect(matchAirport("dusseldorf")?.code).toBe("DUS");
  });
  it("returns null for places it does not know", () => {
    expect(matchAirport("Timbuktu")).toBeNull();
    expect(matchAirport("")).toBeNull();
  });
});

describe("suggestAirports", () => {
  it("puts city matches first and caps the list", () => {
    const names = suggestAirports("lon");
    expect(names[0].code).toBe("LON");
    expect(names.length).toBeLessThanOrEqual(7);
    expect(suggestAirports("")).toEqual([]);
  });
});

describe("link builders", () => {
  it("builds a Skyscanner link with every field", () => {
    const url = buildSkyscannerUrl({ ...base, adults: 2, children: 1, infants: 1, cabin: "premium" }, matchAirport("London")!);
    expect(url).toContain("/transport/flights/lond/los/270330/270405/");
    expect(url).toContain("adultsv2=2");
    expect(url).toContain("cabinclass=premiumeconomy");
    expect(url).toContain("childrenv2=8%7C1");
  });
  it("leaves children off a Skyscanner link when there are none", () => {
    expect(buildSkyscannerUrl(base, matchAirport("MAN")!)).toBe("https://www.skyscanner.net/transport/flights/man/los/270330/270405/?adultsv2=1&cabinclass=economy&rtn=1");
  });
  it("builds Kayak links", () => {
    expect(buildKayakUrl(base, matchAirport("Dublin")!)).toBe("https://www.kayak.co.uk/flights/DUB-LOS/2027-03-30/2027-04-05/1adults");
    expect(buildKayakUrl({ ...base, adults: 2, children: 1, infants: 1, cabin: "business" }, matchAirport("New York")!))
      .toBe("https://www.kayak.co.uk/flights/NYC-LOS/2027-03-30/2027-04-05/business/2adults/children-11-1L");
  });
  it("falls back to a Google Flights phrase for unknown places, safely encoded", () => {
    const links = buildSearchLinks({ ...base, from: "Timbuktu & <beyond>" });
    expect(links.origin).toBeNull();
    expect(links.primarySite).toBe("Google Flights");
    expect(links.kayak).toBeNull();
    expect(links.primary).toBe(buildGoogleFlightsUrl({ ...base, from: "Timbuktu & <beyond>" }, null));
    expect(new URL(links.primary).searchParams.get("q")).toBe("Flights to LOS from Timbuktu & <beyond> on 2027-03-30 through 2027-04-05");
  });
  it("sends known airports to Skyscanner", () => {
    expect(buildSearchLinks(base).primarySite).toBe("Skyscanner");
  });
});

describe("validateSearch", () => {
  it("accepts the defaults and rejects bad input", () => {
    expect(validateSearch(base)).toBeNull();
    expect(validateSearch({ ...base, from: "  " })).toMatch(/flying from/);
    expect(validateSearch({ ...base, return: "2027-03-29" })).toMatch(/before/);
    expect(validateSearch({ ...base, infants: 2 })).toMatch(/infant/);
  });
});
