"use client";

import type { HeatCell } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { cn } from "cn";

type PriceHeatmapProps = {
  cells: HeatCell[];
  selected?: string;
  onSelect?: (date: string) => void;
  formatValue?: (price: number) => string;
};

/** A two-week price grid. Darker green is the lower fare. */
export function PriceHeatmap({ cells, selected, onSelect, formatValue }: PriceHeatmapProps) {
  const prices = cells.map((cell) => cell.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {cells.map((cell) => {
        const ratio = max === min ? 1 : (max - cell.price) / (max - min);
        return (
          <button
            key={cell.date}
            type="button"
            onClick={() => onSelect?.(cell.date)}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center rounded-xl border text-[11px]",
              selected === cell.date ? "border-ink" : "border-transparent",
            )}
            style={{ background: `color-mix(in srgb, var(--saving) ${Math.round(12 + ratio * 68)}%, var(--paper))` }}
            aria-label={`${cell.date}, ${formatValue ? formatValue(cell.price) : formatMoney(cell.price)}`}
            aria-pressed={selected === cell.date}
          >
            <span>{cell.date.slice(8)}</span>
            <span className="num">{Math.round(cell.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
