import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  let current = locale;
  if (!current) {
    try {
      current = await rootLocale();
    } catch {
      current = routing.defaultLocale;
    }
  }
  const resolved = hasLocale(routing.locales, current) ? current : routing.defaultLocale;
  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
