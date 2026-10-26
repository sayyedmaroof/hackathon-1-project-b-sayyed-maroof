import { airports, airportByCode } from "@/lib/mock/airports";
import { faqs, stats, steps, testimonials, ticker } from "@/lib/mock/content";
import { hacks } from "@/lib/mock/hacks";
import { hacksEs } from "@/lib/mock/hacks-es";
import { programs, transfers } from "@/lib/mock/programs";
import type { Hack } from "@/lib/types";

/** Read-only content. Swap this file when a CMS or API arrives. */

export function listAirports() {
  return airports;
}

export function getAirport(code: string) {
  return airportByCode(code) ?? null;
}

export function listHacks(locale: string = "en") {
  return locale === "es" ? hacksEs : hacks;
}

export function getHack(slug: string, locale: string = "en") {
  return listHacks(locale).find((hack) => hack.slug === slug) ?? null;
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
