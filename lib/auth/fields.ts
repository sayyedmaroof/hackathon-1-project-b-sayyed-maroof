import { airportByCode } from "@/lib/mock/airports";
import { routing, type AppLocale } from "@/i18n/routing";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validEmail(value: string) {
  const email = normalizeEmail(value);
  return email.length <= 254 && EMAIL.test(email);
}

export function validPassword(value: string) {
  return value.length >= 8 && value.length <= 200;
}

export function validName(value: string) {
  const name = value.trim();
  return name.length >= 2 && name.length <= 80;
}

export function parseLanguage(value: string): AppLocale | null {
  return routing.locales.includes(value as AppLocale) ? (value as AppLocale) : null;
}

export function parseHomeAirport(value: string) {
  return airportByCode(value.trim())?.code ?? null;
}
