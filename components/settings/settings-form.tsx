"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFareStore } from "@/hooks/use-fare-store";
import { usePathname, useRouter } from "@/i18n/navigation";

export function SettingsForm() {
  const t = useTranslations("pages");
  const common = useTranslations("common");
  const fare = useFareStore();
  const router = useRouter();
  const pathname = usePathname();
  const settings = fare.store.settings;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        toast.success(t("unlocked"));
      }}
    >
      <h1 className="font-display text-4xl tracking-tight">{t("settingsTitle")}</h1>
      <label className="block text-sm">
        {t("authTitle")}
        <input
          className="mt-1 h-11 w-full rounded-xl border border-line px-3"
          value={settings.name}
          onChange={(event) => fare.patchSettings({ name: event.target.value })}
        />
      </label>
      <label className="block text-sm">
        {t("from")}
        <input
          className="mt-1 h-11 w-full rounded-xl border border-line px-3"
          value={settings.homeAirport}
          onChange={(event) => fare.patchSettings({ homeAirport: event.target.value.toUpperCase() })}
        />
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
      <div className="flex gap-2">
        {(["es", "en"] as const).map((locale) => (
          <button key={locale} type="button" className="min-h-11 rounded-full border border-line px-3" onClick={() => router.replace(pathname, { locale })}>
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
      <p className="text-sm text-ink-muted">{common("privacy")}</p>
      <Button type="submit">{t("seeChat")}</Button>
    </form>
  );
}
