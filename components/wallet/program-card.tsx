"use client";

import { useTranslations } from "next-intl";
import { formatCount, formatMoney } from "@/lib/format";
import type { LoyaltyProgram } from "@/lib/types";

/** A points balance, what it is worth, and when it expires. */
export function ProgramCard({ program }: { program: LoyaltyProgram }) {
  const t = useTranslations("pages");
  const progress = Math.min(100, Math.round((program.balance / Math.max(program.nextTripCost, 1)) * 100));
  const gap = Math.max(0, program.nextTripCost - program.balance);

  return (
    <article className="rounded-[24px] border border-line bg-surface p-5">
      <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">{program.kind}</p>
      <h2 className="mt-1 font-display text-3xl tracking-tight">{program.name}</h2>
      <p className="num mt-3 text-2xl">
        {formatCount(program.balance)} {program.unit}
      </p>
      <p className="text-sm text-saving">{t("worth", { amount: formatMoney(program.euroValue) })}</p>
      <p className="mt-1 text-xs text-ink-muted">{t("expires", { date: program.expiry })}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full bg-saving" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        {gap === 0
          ? t("coverTrip")
          : t("shortOf", { count: formatCount(gap), unit: program.unit })}
      </p>
    </article>
  );
}
