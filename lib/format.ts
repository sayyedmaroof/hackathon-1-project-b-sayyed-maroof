import type { CurrencyCode } from "@/lib/types";

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Intl can emit different spaces in Node and the browser. One space keeps SSR stable. */
function stable(formatted: string) {
  return formatted.replace(/[\u00A0\u202F\u2007\u2009]/g, " ");
}

/** Format a euro amount. Display currency is euros. */
export function formatMoney(amount: number, currency: CurrencyCode = "EUR") {
  if (currency !== "EUR") return stable(euro.format(Math.round(amount)));
  return stable(euro.format(Math.round(amount)));
}

/** Grouped count, same space rules as money. */
export function formatCount(value: number) {
  return stable(new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value));
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
  timeZone: "UTC",
});

/** Calendar day from the ISO date, not the viewer's timezone. */
export function formatDay(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return dayFormatter.format(date);
}

/** Wall-clock time written on the ticket. Offsets stay with the airport, not the browser. */
export function formatTime(iso: string) {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return iso;
  return `${match[1]}:${match[2]}`;
}

export function formatPricedAt(iso: string) {
  return `Prices as of ${formatTime(iso)}`;
}
