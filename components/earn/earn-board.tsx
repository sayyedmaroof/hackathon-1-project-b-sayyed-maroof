"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PhotoMast } from "@/components/layout/photo-mast";
import { SampleNote } from "@/components/layout/sample-note";
import { Button } from "@/components/ui/button";
import { monthlyPoints, netAnnualValue, pointsGap, recommendPlan, buyPointsAllowed } from "@/lib/agent/gates";
import { useFareStore } from "@/hooks/use-fare-store";
import { formatCount, formatMoney } from "@/lib/format";
import { revolutPlans, shoppingMultiplier } from "@/lib/mock/reference";

/** Earn planner. Spending inputs are only money the person already spends. */
export function EarnBoard() {
  const t = useTranslations("pages");
  const widgets = useTranslations("widgets");
  const [parts, setParts] = useState([400, 250, 120, 180, 150]);
  const [acknowledged, setAcknowledged] = useState(false);
  const spend = parts.reduce((sum, value) => sum + value, 0);
  const advice = recommendPlan(spend);
  const target = useFareStore().store.board[0]?.points ?? 0;
  const owned = useFareStore().store.wallet.reduce((sum, program) => sum + program.balance, 0);
  const gap = pointsGap(target, owned);
  const canBuy = buyPointsAllowed({
    availabilityShown: target > 0,
    userConfirmed: target > 0,
    acknowledged,
    gapPoints: gap,
  });
  const categories = t.raw("categories") as string[];
  const months = gap === 0 ? 0 : Math.ceil(gap / Math.max(monthlyPoints("metal", spend), 1));

  return (
    <div className="space-y-8">
      <PhotoMast id="cards" />
      <div>
        <h1 className="font-display text-4xl tracking-tight">{t("earnTitle")}</h1>
        <p className="mt-2 text-sm text-ink-muted">{t("earnHelp")}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {categories.map((label, index) => (
          <label key={label} className="text-sm">
            {label}
            <input
              className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
              inputMode="numeric"
              value={parts[index]}
              aria-label={label}
              onChange={(event) =>
                setParts((current) => current.map((value, i) => (i === index ? Number(event.target.value) || 0 : value)))
              }
            />
          </label>
        ))}
      </div>
      <p className="text-sm">{widgets("spend")}: {formatMoney(spend)}</p>
      <div className="grid gap-3 md:grid-cols-3">
        {revolutPlans.map((plan, index) => {
          const credit = plan.id === "ultra";
          const net = netAnnualValue(plan.id, spend, credit);
          return (
            <article key={plan.id} className="lift rise-in rounded-[24px] border border-line bg-surface p-4" style={{ animationDelay: `${index * 0.08}s` }}>
              <h2 className="font-display text-2xl capitalize">{plan.id}</h2>
              <p className="num">{formatMoney(plan.monthlyFee)}</p>
              <p className="mt-2 text-sm">{formatCount(monthlyPoints(plan.id, spend, credit))} / month</p>
              <p className="num text-sm">{formatMoney(net)}</p>
            </article>
          );
        })}
      </div>
      <p className="text-sm">{advice.id ? widgets("best", { plan: advice.id }) : widgets("nonePays")}</p>
      <article className="rounded-[24px] border border-line p-4 text-sm">
        <p>
          {widgets("example", {
            spend: formatMoney(shoppingMultiplier.exampleSpend),
            rate: shoppingMultiplier.rate,
            boosted: formatCount(shoppingMultiplier.boostedPoints),
            normal: formatCount(shoppingMultiplier.normalPoints),
          })}
        </p>
        <p className="mt-2">{widgets("onlyIf")}</p>
        <SampleNote className="mt-2" />
      </article>
      <article className="rounded-[24px] border border-line p-4">
        <h2 className="font-display text-2xl">{widgets("gap")}</h2>
        {target === 0 ? (
          <p className="mt-2 text-sm text-warn">{t("buyBlocked")}</p>
        ) : (
          <>
            <p className="mt-2 text-sm">
              {formatCount(owned)} / {formatCount(target)} · {months} months
            </p>
            <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
              />
              {widgets("acknowledge")}
            </label>
            <Button type="button" className="mt-3" disabled={!canBuy}>
              {widgets("whatHappens")}
            </Button>
            {!canBuy ? <p className="mt-2 text-sm text-warn">{t("buyBlocked")}</p> : null}
          </>
        )}
      </article>
    </div>
  );
}
