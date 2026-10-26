"use client";

import { CountUp } from "@/components/fare/count-up";
import { formatMoney } from "@/lib/format";

/** The running total of award value versus the cash still due. */
export function TotalSavedCounter({ amount }: { amount: number }) {
  return (
    <p className="text-saving">
      <span className="font-display text-5xl tracking-[-0.04em] md:text-7xl">
        <CountUp value={amount} format={(value) => formatMoney(value)} />
      </span>
    </p>
  );
}
