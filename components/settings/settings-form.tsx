"use client";

import { toast } from "sonner";
import { AirportCombobox } from "@/components/search/airport-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { usePreferences } from "@/hooks/use-preferences";
import type { CurrencyCode } from "@/lib/types";

const currencies: CurrencyCode[] = ["EUR", "GBP", "USD"];

/** Preferences stored on this device. */
export function SettingsForm() {
  const { prefs, update, ready } = usePreferences();
  if (!ready) return <p className="text-sm text-ink-muted">Loading your settings…</p>;

  return (
    <form
      className="max-w-xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Settings saved on this device");
      }}
    >
      <label className="block text-sm">
        Name
        <Input className="mt-1" value={prefs.name} onChange={(event) => update({ name: event.target.value })} />
      </label>
      <label className="block text-sm">
        Email
        <Input
          className="mt-1"
          type="email"
          value={prefs.email}
          onChange={(event) => update({ email: event.target.value })}
        />
      </label>
      <AirportCombobox
        label="Home airport"
        value={prefs.homeAirport}
        onChange={(homeAirport) => update({ homeAirport })}
      />
      <div>
        <p className="text-sm">Currency</p>
        <div className="mt-2 flex gap-2" role="group" aria-label="Currency">
          {currencies.map((currency) => (
            <button
              key={currency}
              type="button"
              aria-pressed={prefs.currency === currency}
              className={`min-h-11 rounded-full border px-4 text-sm ${prefs.currency === currency ? "border-ink bg-ink text-paper" : "border-line"}`}
              onClick={() => update({ currency })}
            >
              {currency}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-muted">GBP and USD use sample rates. Prices are stored in euros.</p>
      </div>
      <label className="block text-sm">
        Default value of an hour (€)
        <Input
          className="mt-1"
          inputMode="numeric"
          value={String(prefs.timeValue)}
          onChange={(event) => update({ timeValue: Number(event.target.value) || 0 })}
        />
      </label>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
        <span className="text-sm">Price alerts</span>
        <Switch
          checked={prefs.alerts}
          onCheckedChange={(checked) => update({ alerts: checked })}
          aria-label="Price alerts"
        />
      </div>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
        <span className="text-sm">Product notes</span>
        <Switch
          checked={prefs.productUpdates}
          onCheckedChange={(checked) => update({ productUpdates: checked })}
          aria-label="Product notes"
        />
      </div>
      <Button type="submit">Save settings</Button>
    </form>
  );
}
