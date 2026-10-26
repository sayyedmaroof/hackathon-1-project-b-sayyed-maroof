"use client";

import { Switch } from "@/components/ui/switch";

/** Lets the search move the trip by a few days. */
export function FlexibilityToggle({
  enabled,
  days,
  onChange,
}: {
  enabled: boolean;
  days: number;
  onChange: (next: { enabled: boolean; days: number }) => void;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3">
      <div>
        <p className="text-sm">Flexible dates</p>
        <p className="text-xs text-ink-muted">±{days} days around your pick</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={(checked) => onChange({ enabled: checked, days })}
        aria-label="Allow flexible dates"
      />
    </div>
  );
}
