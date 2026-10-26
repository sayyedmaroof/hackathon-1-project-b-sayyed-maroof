import { airports, airportByCode } from "@/lib/mock/airports";
import { faqs, stats, steps, testimonials, ticker } from "@/lib/mock/content";
import { hacks } from "@/lib/mock/hacks";
import { buildOptions, getMockOption, showcaseOptions } from "@/lib/mock/options";
import type { TripQuery } from "@/lib/types";
import { programs, transfers } from "@/lib/mock/programs";
import type { Hack } from "@/lib/types";

/** Read-only content. Swap this file when a CMS or API arrives. */

export function listAirports() {
  return airports;
}

export function getAirport(code: string) {
  return airportByCode(code) ?? null;
}

export function listHacks() {
  return hacks;
}

export function getHack(slug: string) {
  return hacks.find((hack) => hack.slug === slug) ?? null;
}

export function listHackSlugs(): Hack[] {
  return hacks.map((hack) => hack.slug);
}

export function listFaqs() {
  return faqs;
}

export function listStats() {
  return stats;
}

export function listSteps() {
  return steps;
}

export function listTestimonials() {
  return testimonials;
}

export function listTicker() {
  return ticker;
}

export function listPrograms() {
  return programs;
}

export function listTransfers() {
  return transfers;
}

export function listShowcaseTrips() {
  return showcaseOptions();
}

export function findOption(id: string) {
  return getMockOption(id);
}

/** Ids we can prerender. Other saved trips resolve on the client. */
export function listKnownOptionIds() {
  const routes = [
    ["MAD", "LIS"],
    ["CDG", "FCO"],
    ["BER", "BCN"],
  ];
  return routes.flatMap(([from, to]) => {
    const query: TripQuery = {
      mode: "quick",
      travellers: 1,
      cabin: "economy",
      flexDays: 0,
      legs: [{ id: "leg-1", from: from!, to: to!, depart: "2026-11-12" }],
    };
    return buildOptions(query).map((option) => option.id);
  });
}
