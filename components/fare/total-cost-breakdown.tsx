"use client";

import { usePreferences } from "@/hooks/use-preferences";
import { formatMoney } from "@/lib/format";
import type { CostLine } from "@/lib/types";

const tones: Record<CostLine["kind"], string> = {
  fare: "bg-ink",
  bags: "bg-accent",
  ground: "bg-warn",
  taxes: "bg-ink-muted",
};

/** Fare, bags, ground and taxes, as a stacked bar and a list. */
export function TotalCostBreakdown({ lines }: { lines: CostLine[] }) {
  const { prefs } = usePreferences();
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const shown = lines.some((line) => line.amount > 0)
    ? lines.filter((line) => line.amount > 0)
    : lines;

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
        {shown.map((line) => (
          <span
            key={line.kind}
            className={tones[line.kind]}
            style={{ width: total ? `${(line.amount / total) * 100}%` : "0%" }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {shown.map((line) => (
          <li key={line.kind} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${tones[line.kind]}`} aria-hidden="true" />
              {line.label}
            </span>
            <span className="num">{formatMoney(line.amount, prefs.currency)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between border-t border-line pt-3 text-sm font-medium">
        <span>True total</span>
        <span className="num">{formatMoney(total, prefs.currency)}</span>
      </p>
    </div>
  );
}
