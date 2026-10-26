"use client";

import { FlipNumber } from "@/components/fare/flip-number";
import { SavingsBadge } from "@/components/fare/savings-badge";
import { usePreferences } from "@/hooks/use-preferences";
import { formatMoney, formatSaving } from "@/lib/format";
import { cn } from "cn";

type PriceCompareProps = {
  normal: number;
  hacked: number;
  percent: number;
  className?: string;
  size?: "md" | "lg";
};

/** Struck normal fare, then the hacked fare on the split-flap. */
export function PriceCompare({
  normal,
  hacked,
  percent,
  className,
  size = "md",
}: PriceCompareProps) {
  const { prefs } = usePreferences();
  const currency = prefs.currency;

  return (
    <div className={cn("flex flex-wrap items-end gap-x-4 gap-y-2", className)}>
      <p className="num text-ink-muted line-through decoration-ink-muted/70">
        <span className="sr-only">Normal price </span>
        {formatMoney(normal, currency)}
      </p>
      <p
        className={cn(
          "font-medium text-ink",
          size === "lg" ? "text-5xl md:text-6xl" : "text-3xl",
        )}
      >
        <span className="sr-only">Hacked price </span>
        <FlipNumber value={formatMoney(hacked, currency)} />
      </p>
      <p className="num text-saving">
        <span className="sr-only">You save </span>
        {formatSaving(normal - hacked, currency)}
      </p>
      <SavingsBadge percent={percent} size={size === "lg" ? "lg" : "md"} />
    </div>
  );
}
