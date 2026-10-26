"use client";

import { useState } from "react";
import { FlipNumber } from "@/components/fare/flip-number";
import { Slider } from "@/components/ui/slider";
import { usePreferences } from "@/hooks/use-preferences";
import { formatMoney } from "@/lib/format";

/** Converts a balance into a sample euro value at 1.2 cents a point. */
export function PointsCalculator({ initial = 38000 }: { initial?: number }) {
  const [points, setPoints] = useState(initial);
  const { prefs } = usePreferences();
  return (
    <div className="rounded-[24px] border border-line p-5">
      <p className="text-sm text-ink-muted">Points on a sample flight</p>
      <p className="mt-2 text-4xl text-saving">
        <FlipNumber value={formatMoney(Math.round(points * 0.012), prefs.currency)} />
      </p>
      <Slider
        className="mt-4"
        min={0}
        max={120000}
        step={1000}
        value={[points]}
        onValueChange={(value) => {
          const next = Array.isArray(value) ? value[0] : value;
          if (typeof next === "number") setPoints(next);
        }}
        aria-label="Points to convert"
      />
    </div>
  );
}
