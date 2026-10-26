"use client";

import { FlipNumber } from "@/components/fare/flip-number";
import { SavingsBadge } from "@/components/fare/savings-badge";
import { formatMoney, formatSaving } from "@/lib/format";
import { cn } from "cn";

type PriceCompareProps = {
  normal: number;
  hacked: number;
  /** Shown on the flap when the landed price is not a cash amount. */
  hackedLabel?: string;
  percent: number;
  className?: string;
  size?: "md" | "lg";
  showSaving?: boolean;
};

/** Struck cash fare, then the award price on the split-flap. */
export function PriceCompare({
  normal,
  hacked,
  hackedLabel,
  percent,
  className,
  size = "md",
  showSaving = true,
}: PriceCompareProps) {
  return (
    <div className={cn("flex flex-wrap items-end gap-x-4 gap-y-2", className)}>
      <p className="num text-ink-muted line-through decoration-ink-muted/70">
        {formatMoney(normal)}
      </p>
      <p
        className={cn(
          "font-medium text-ink",
          size === "lg" ? "text-5xl md:text-6xl" : "text-3xl",
        )}
      >
        <FlipNumber value={hackedLabel ?? formatMoney(hacked)} />
      </p>
      {showSaving ? (
        <>
          <p className="num text-saving">{formatSaving(normal - hacked)}</p>
          <SavingsBadge percent={percent} size={size === "lg" ? "lg" : "md"} />
        </>
      ) : null}
    </div>
  );
}
