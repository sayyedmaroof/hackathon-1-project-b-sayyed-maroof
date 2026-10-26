import "server-only";

import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requestLocale } from "@/lib/auth/locale";
import { getSession } from "@/lib/auth/session";

export async function redirectTo(path: string): Promise<never> {
  const locale = await requestLocale();
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  redirect(`${prefix}${path}`);
}

export async function redirectIfSignedIn() {
  const session = await getSession();
  if (session) await redirectTo("/chat");
}
