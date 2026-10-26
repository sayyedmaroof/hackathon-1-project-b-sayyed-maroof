"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PhotoMast } from "@/components/layout/photo-mast";
import { SampleNote } from "@/components/layout/sample-note";
import { Button } from "@/components/ui/button";
import { useFareStore } from "@/hooks/use-fare-store";
import { farePlans, type PlanId } from "@/lib/plans";
import { formatMoney } from "@/lib/format";
import { usageLevel } from "@/lib/agent/gates";

export function PricingBoard() {
  const t = useTranslations("pages");
  const fare = useFareStore();
  const [open, setOpen] = useState(false);
  const level = usageLevel(fare.store.searches, fare.plan.searches);
  const price = (id: PlanId) => {
    const plan = farePlans.find((item) => item.id === id)!;
    return fare.store.billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
  };

  return (
    <div className="space-y-8">
      <PhotoMast id="wallet" />
      <h1 className="font-display text-4xl tracking-tight">{t("pricingTitle")}</h1>
      <div className="flex gap-2">
        {(["monthly", "annual"] as const).map((billing) => (
          <button
            key={billing}
            type="button"
            className="min-h-11 rounded-full border border-line px-3 text-sm"
            onClick={() => fare.setBilling(billing)}
          >
            {t(billing)}
          </button>
        ))}
      </div>
      <p className="text-sm">
        {fare.store.searches}/{fare.plan.searches} · {level}
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {farePlans.map((plan) => (
          <article key={plan.id} className="lift rounded-[24px] border border-line bg-surface p-5">
            <h2 className="font-display text-3xl capitalize">{plan.id}</h2>
            <p className="num mt-2 text-2xl">{formatMoney(price(plan.id))}</p>
            <ul className="mt-3 space-y-1 text-sm text-ink-muted">
              <li>{plan.searches} / month</li>
              <li>{plan.horizonMonths} months</li>
              <li>{plan.saved} itineraries</li>
              <li>{plan.alerts ? "Alerts" : "No alerts"}</li>
              <li>{plan.refresh}</li>
            </ul>
            {plan.id !== "free" ? (
              <Button type="button" className="mt-4" onClick={() => setOpen(true)}>
                {t("upgrade")}
              </Button>
            ) : null}
          </article>
        ))}
      </div>
      <SampleNote />
      {open ? (
        <div className="rounded-[24px] border border-line p-5" role="dialog" aria-modal="true">
          <p>{t("checkout")}</p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => {
              fare.setPlan("pro");
              setOpen(false);
              toast.success(t("unlocked"));
            }}
          >
            {t("upgrade")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
