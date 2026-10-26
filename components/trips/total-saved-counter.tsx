"use client";

import { CountUp } from "@/components/fare/count-up";
import { usePreferences } from "@/hooks/use-preferences";
import { formatMoney } from "@/lib/format";

/** The running total of savings on saved trips. */
export function TotalSavedCounter({ amount }: { amount: number }) {
  const { prefs } = usePreferences();
  return (
    <p className="text-saving">
      <span className="font-display text-5xl tracking-[-0.04em] md:text-7xl">
        <CountUp value={amount} format={(value) => formatMoney(value, prefs.currency)} />
      </span>
    </p>
  );
}
