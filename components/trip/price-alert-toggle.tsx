"use client";

import { Switch } from "@/components/ui/switch";

/** Turns a price watch on for a saved trip. */
export function PriceAlertToggle({
  checked,
  onChange,
  signal,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  signal: "book" | "wait";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
      <div>
        <p className="text-sm font-medium">Price alert</p>
        <p className="text-xs text-ink-muted">
          {signal === "book" ? "Book now — this sample seat is the cheap one." : "You can wait — the sample signal is calm."}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label="Price alert" />
    </div>
  );
}
