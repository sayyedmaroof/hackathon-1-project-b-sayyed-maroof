"use client";

import { useLocale, useTranslations } from "next-intl";
import { AwardOptionCard } from "@/components/chat/widget-view";
import { TotalCostBreakdown } from "@/components/fare/total-cost-breakdown";
import { RouteMap } from "@/components/fare/route-map";
import { PriceAlertToggle } from "@/components/trip/price-alert-toggle";
import { Timeline } from "@/components/trip/timeline";
import { TransferDiagram } from "@/components/wallet/transfer-diagram";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { balanceAwards, jnbAwards, nowAwards } from "@/lib/agent/fixtures";
import { useChat } from "@/hooks/use-chat";
import { useFareStore } from "@/hooks/use-fare-store";

const awards = [...jnbAwards, ...balanceAwards, ...nowAwards];

export function TripAward({ id }: { id: string }) {
  const t = useTranslations("pages");
  const locale = useLocale();
  const fare = useFareStore();
  const chat = useChat(locale === "en" ? "en" : "es");
  const award = awards.find((item) => item.id === id) ?? awards[0]!;
  const paid = fare.plan.alerts;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="h-48 rounded-[24px] border border-line bg-surface p-3">
        <RouteMap
          pairs={[{ from: award.originCode, to: award.destinationCode }]}
          label={t("mapLabel")}
        />
      </div>
      <AwardOptionCard option={award} onPin={(option) => chat.pinAward(option, "plan")} />
      <Timeline
        legs={[
          {
            from: award.originCode,
            to: award.destinationCode,
            departAt: award.depart,
            arriveAt: award.returnDate ?? award.depart,
            carrier: award.program,
            flightNumber: "",
            durationMinutes: 0,
          },
        ]}
      />
      <TotalCostBreakdown
        totalLabel={t("trueTotal")}
        lines={[
          { label: t("costPoints"), amount: award.points, kind: "points" },
          { label: t("costTaxes"), amount: award.taxes, kind: "taxes" },
          { label: t("costSurcharges"), amount: award.surcharges, kind: "surcharges" },
          { label: t("costFees"), amount: award.cardFees, kind: "fees" },
        ]}
      />
      <PriceAlertToggle
        checked={fare.store.settings.alerts}
        onChange={(alerts) => fare.patchSettings({ alerts })}
        title={t("alertTitle")}
        body={award.risk === "low" ? t("alertBook") : t("alertWait")}
        lockedLabel={paid ? undefined : t("alertsNeedPlan")}
        upgradeHref={paid ? undefined : "/pricing"}
      />
      <TransferDiagram />
      <Button render={<Link href="/chat" />}>{t("seeChat")}</Button>
    </div>
  );
}
