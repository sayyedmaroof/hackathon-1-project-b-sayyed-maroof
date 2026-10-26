import "server-only";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";

function localeFromPath(pathname: string): AppLocale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first || first === routing.defaultLocale) return null;
  return routing.locales.includes(first as AppLocale) ? (first as AppLocale) : null;
}

export async function requestLocale(): Promise<AppLocale> {
  const headerList = await headers();
  const referer = headerList.get("referer");
  if (referer) {
    try {
      const fromReferer = localeFromPath(new URL(referer).pathname);
      if (fromReferer) return fromReferer;
    } catch {
      // A malformed referer falls through to the locale header.
    }
  }

  const hinted = headerList.get("x-next-intl-locale");
  if (hinted && routing.locales.includes(hinted as AppLocale)) return hinted as AppLocale;

  const current = await getLocale();
  return routing.locales.includes(current as AppLocale) ? (current as AppLocale) : routing.defaultLocale;
}
