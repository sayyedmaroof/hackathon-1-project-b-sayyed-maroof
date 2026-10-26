"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateProfile } from "@/lib/auth/actions";
import type { ProfileFormState } from "@/lib/auth/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFareStore } from "@/hooks/use-fare-store";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { airports } from "@/lib/mock/airports";

type Profile = {
  name: string;
  language: AppLocale;
  homeAirport: string;
};

function profileError(error: Exclude<ProfileFormState, { ok: true } | null>["error"]) {
  switch (error) {
    case "bad_name":
      return "authNameShort";
    case "airport":
      return "authAirport";
    case "language":
      return "authLanguage";
    case "unauthenticated":
    case "not_found":
      return "settingsNeedAccount";
  }
}

export function SettingsForm({ profile }: { profile: Profile | null }) {
  const t = useTranslations("pages");
  const common = useTranslations("common");
  const fare = useFareStore();
  const settings = fare.store.settings;
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [state, action, pending] = useActionState(updateProfile, null as ProfileFormState);
  const [name, setName] = useState(profile?.name ?? "");
  const [language, setLanguage] = useState<AppLocale>(profile?.language ?? "en");
  const [homeAirport, setHomeAirport] = useState(profile?.homeAirport ?? "");

  useEffect(() => {
    if (!state?.ok) return;
    toast.success(t("settingsSaved"));
    if (state.language !== locale) router.replace(pathname, { locale: state.language });
  }, [locale, pathname, router, state, t]);

  if (!profile) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-4xl tracking-tight">{t("settingsTitle")}</h1>
        <p className="text-sm text-ink-muted">{t("settingsNeedAccount")}</p>
        <Button render={<Link href="/login" />}>{common("login")}</Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <h1 className="font-display text-4xl tracking-tight">{t("settingsTitle")}</h1>
      {state && !state.ok ? <p className="text-sm text-risk">{t(profileError(state.error))}</p> : null}
      <label className="block text-sm" htmlFor="name">
        {common("name")}
        <Input className="mt-1" id="name" name="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
      </label>
      <label className="block text-sm" htmlFor="language">
        {common("language")}
        <select
          id="language"
          name="language"
          className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm"
          value={language}
          onChange={(event) => setLanguage(event.target.value as AppLocale)}
        >
          <option value="en">{t("languageEn")}</option>
          <option value="es">{t("languageEs")}</option>
        </select>
      </label>
      <label className="block text-sm" htmlFor="home-airport">
        {common("homeAirport")}
        <Input
          className="mt-1"
          id="home-airport"
          name="homeAirport"
          list="airports"
          value={homeAirport}
          onChange={(event) => setHomeAirport(event.target.value.toUpperCase())}
          autoComplete="off"
          required
          maxLength={3}
        />
        <datalist id="airports">
          {airports.map((airport) => (
            <option key={airport.code} value={airport.code}>
              {airport.city}
            </option>
          ))}
        </datalist>
      </label>
      <label className="flex min-h-11 items-center justify-between text-sm">
        {t("alertsNeedPlan")}
        <input
          type="checkbox"
          checked={settings.alerts}
          disabled={!fare.plan.alerts}
          onChange={(event) => fare.patchSettings({ alerts: event.target.checked })}
        />
      </label>
      {!fare.plan.alerts ? <p className="text-sm text-warn">{t("alertsNeedPlan")}</p> : null}
      <p className="text-sm text-ink-muted">{common("privacy")}</p>
      <Button type="submit" disabled={pending}>
        {pending ? common("loading") : common("save")}
      </Button>
    </form>
  );
}
