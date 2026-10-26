import type { CurrencyCode } from "@/lib/types";

/**
 * Sample display rates against EUR. Canonical prices stay in euros.
 * SAMPLE RATES — not live FX.
 */
export const SAMPLE_RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  GBP: 0.86,
  USD: 1.08,
};

const formatters: Record<CurrencyCode, Intl.NumberFormat> = {
  EUR: new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }),
  GBP: new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }),
};

/** Format a euro amount in the selected display currency. */
export function formatMoney(eur: number, currency: CurrencyCode = "EUR") {
  const converted = Math.round(eur * SAMPLE_RATES[currency]);
  return formatters[currency].format(converted);
}

/** Signed saving, e.g. "−225 €". */
export function formatSaving(eur: number, currency: CurrencyCode = "EUR") {
  const amount = formatMoney(Math.abs(eur), currency);
  return eur >= 0 ? `−${amount}` : `+${amount}`;
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatDuration(minutes: number) {
  const sign = minutes < 0 ? "−" : "";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (hours === 0) return `${sign}${mins}m`;
  if (mins === 0) return `${sign}${hours}h`;
  return `${sign}${hours}h ${mins}m`;
}

export function formatExtraTime(minutes: number) {
  if (minutes === 0) return "Same time";
  const formatted = formatDuration(minutes);
  return minutes > 0 ? `+${formatted}` : formatted;
}

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dayFormatter.format(date);
}

export function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return timeFormatter.format(date);
}

export function formatPricedAt(iso: string) {
  return `Prices as of ${formatTime(iso)}`;
}
