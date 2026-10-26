"use client";

import { Slider } from "@/components/ui/slider";
import { usePreferences } from "@/hooks/use-preferences";
import { formatMoney } from "@/lib/format";

/** Re-ranks results by what an extra hour is worth to you. */
export function TimeValueSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const { prefs } = usePreferences();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="time-value" className="text-sm font-medium">
          What is your time worth?
        </label>
        <p className="num text-sm">{formatMoney(value, prefs.currency)} / hour</p>
      </div>
      <Slider
        id="time-value"
        className="mt-3"
        min={0}
        max={80}
        step={5}
        value={[value]}
        onValueChange={(next) => {
          const amount = Array.isArray(next) ? next[0] : next;
          if (typeof amount === "number") onChange(amount);
        }}
        aria-label="Value of an hour"
      />
      <p className="mt-2 text-xs text-ink-muted">
        A longer hack has to save more than this before it ranks first.
      </p>
    </div>
  );
}
