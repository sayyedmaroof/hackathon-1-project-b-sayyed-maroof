"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { BoardingPassCard } from "@/components/fare/boarding-pass";
import { FlipNumber } from "@/components/fare/flip-number";
import { PriceCompare } from "@/components/fare/price-compare";
import { PriceHeatmap } from "@/components/fare/price-heatmap";
import { RiskLabel } from "@/components/fare/risk-label";
import { SampleNote } from "@/components/layout/sample-note";
import { WhyItWorks } from "@/components/fare/why-it-works";
import { Button } from "@/components/ui/button";
import { monthlyPoints, netAnnualValue, pointsGap, recommendPlan } from "@/lib/agent/gates";
import { ConfirmActionCard } from "@/components/chat/confirm-action-card";
import { useFareStore } from "@/hooks/use-fare-store";
import type { AwardOption, WidgetPart } from "@/lib/agent/widgets";
import { formatCount, formatMoney } from "@/lib/format";
import { revolutPlans } from "@/lib/mock/reference";
import { SHOW_SAMPLE_BADGE } from "@/lib/mock/flag";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function outlay(option: AwardOption) {
  return option.taxes + option.surcharges + option.cardFees;
}

function saving(option: AwardOption) {
  return option.cashPrice - outlay(option);
}

export function SourcesFooter({ sources }: { sources: { label: string; lastVerified: string }[] }) {
  const t = useTranslations("common");
  return (
    <p className="mt-3 text-xs text-ink-muted">
      {t("sources")}: {sources.map((source) => `${source.label} · ${source.lastVerified}`).join(" · ")}
    </p>
  );
}

export function DisclosureNote() {
  const t = useTranslations("common");
  return <p className="text-xs text-ink-muted">{t("disclosure")}</p>;
}

function Frame({
  frozen,
  children,
  onRefresh,
}: {
  frozen?: boolean;
  children: React.ReactNode;
  onRefresh?: () => void;
}) {
  const t = useTranslations("common");
  return (
    <div className={cn(frozen && "opacity-80")}>
      {frozen ? (
        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-ink-muted">
          <span>{t("frozen")}</span>
          {onRefresh ? (
            <button type="button" className="min-h-11 underline" onClick={onRefresh}>
              {t("refresh")}
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function AwardOptionCard({
  option,
  frozen,
  onPin,
}: {
  option: AwardOption;
  frozen?: boolean;
  onPin?: (option: AwardOption) => void;
}) {
  const t = useTranslations("widgets");
  const common = useTranslations("common");
  const saved = saving(option);
  const reduce = useReducedMotion();
  const landed = `${formatCount(option.points)} + ${formatMoney(outlay(option))}`;
  const [flap, setFlap] = useState(() => formatMoney(option.cashPrice));
  const [showWhy, setShowWhy] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setTimeout(() => setFlap(landed), 700);
    return () => window.clearTimeout(timer);
  }, [landed, reduce]);

  const shown = reduce ? landed : flap;
  return (
    <Frame frozen={frozen}>
      <BoardingPassCard
        stub={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-ink-muted">{common("verified", { minutes: option.verifiedMinutesAgo })}</span>
            <span className="text-xs">{t("seats", { count: option.seats })}</span>
          </div>
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">{option.program}</p>
            <h3 className="font-display text-3xl tracking-tight">
              {option.originCode} → {option.destinationCode}
            </h3>
          </div>
          <RiskLabel risk={option.risk} />
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          {option.depart}
          {option.returnDate ? ` – ${option.returnDate}` : ""} · {option.cabin}
        </p>
        <div className="mt-4">
          <PriceCompare
            normal={option.cashPrice}
            hacked={outlay(option)}
            hackedLabel={shown}
            percent={Math.round((saved / Math.max(option.cashPrice, 1)) * 100)}
            showSaving={false}
          />
        </div>
        {saved > 0 ? (
          <p className="mt-2 text-sm text-saving">{t("saves", { amount: formatMoney(saved) })}</p>
        ) : (
          <p className="mt-2 text-sm text-warn">{t("cashWins")}</p>
        )}
        <p className="num mt-1 text-xs text-ink-muted">
          {((saved / Math.max(option.points, 1)) * 100).toFixed(1)} ¢
        </p>
        {SHOW_SAMPLE_BADGE ? <SampleNote className="mt-2" /> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => onPin?.(option)}>
            {common("pin")}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShowWhy((open) => !open)}>
            {common("why")}
          </Button>
        </div>
        {showWhy ? (
          <div className="mt-3">
            <WhyItWorks text={option.why} />
          </div>
        ) : null}
        <SourcesFooter sources={option.sources} />
      </BoardingPassCard>
    </Frame>
  );
}

export function WidgetView({
  widget,
  availabilityShown,
  availabilityConfirmed,
  onConfirmAvailability,
  onPin,
  onConfirmAction,
}: {
  widget: WidgetPart;
  availabilityShown: boolean;
  availabilityConfirmed: boolean;
  onConfirmAvailability: () => void;
  onPin: (option: AwardOption) => void;
  onConfirmAction?: (action: "transfer" | "buy" | "alert" | "upgrade") => void;
}) {
  const t = useTranslations("widgets");
  const common = useTranslations("common");
  const fare = useFareStore();
  const [selectedDate, setSelectedDate] = useState<string>();

  if (widget.type === "strategy") {
    return (
      <Frame frozen={widget.frozen}>
        <article className="rounded-[24px] border border-line bg-surface p-5">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs tracking-[0.14em] text-ink-muted uppercase">{t("goal")}</dt>
              <dd className="font-display text-2xl">{widget.data.goal}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">{t("programs")}</dt>
              <dd>{widget.data.programs.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">{t("method")}</dt>
              <dd>{widget.data.earnMethod}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">{t("route")}</dt>
              <dd>{widget.data.route}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">{t("next")}</dt>
              <dd>{widget.data.nextStep}</dd>
            </div>
          </dl>
          <h3 className="mt-4 text-sm font-medium">{t("reminders")}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
            {widget.data.reminders.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => toast.success(common("save"))}>
              {t("saveBoard")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigator.clipboard?.writeText(widget.data.goal);
                toast(t("pdfSoon"));
              }}
            >
              {t("exportPdf")}
            </Button>
          </div>
          <SampleNote className="mt-3" />
        </article>
      </Frame>
    );
  }

  if (widget.type === "award") {
    return <AwardOptionCard option={widget.option} frozen={widget.frozen} onPin={onPin} />;
  }

  if (widget.type === "compare") {
    const best = [...widget.options].sort((a, b) => saving(b) - saving(a))[0];
    return (
      <Frame frozen={widget.frozen}>
        <div className="flex snap-x gap-3 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible">
          {widget.options.map((option) => (
            <div key={option.id} className="min-w-[85%] snap-start md:min-w-0">
              <AwardOptionCard option={option} onPin={onPin} />
            </div>
          ))}
        </div>
        {best ? (
          <p className={cn("mt-3 text-sm", saving(best) > 0 ? "text-saving" : "text-warn")}>
            {saving(best) > 0 ? t("saves", { amount: formatMoney(saving(best)) }) : t("cashWins")}
          </p>
        ) : null}
      </Frame>
    );
  }

  if (widget.type === "availability") {
    return (
      <Frame frozen={widget.frozen}>
        <section className="rounded-[24px] border border-line bg-surface p-4">
          <h3 className="font-display text-2xl">{t("availability")}</h3>
          <p className="text-xs text-ink-muted">{t("legend")}</p>
          <div className="mt-3">
            <PriceHeatmap
              cells={widget.cells.map((cell) => ({ date: cell.date, price: cell.points }))}
              selected={selectedDate}
              formatValue={(points) => formatCount(points)}
              onSelect={setSelectedDate}
            />
          </div>
          <Button type="button" className="mt-3" onClick={onConfirmAvailability}>
            {t("confirmSeat")}
          </Button>
          <SampleNote className="mt-3" />
        </section>
      </Frame>
    );
  }

  if (widget.type === "plans") {
    const advice = recommendPlan(widget.spend);
    return (
      <Frame frozen={widget.frozen}>
        <div className="grid gap-3 md:grid-cols-3">
          {revolutPlans.map((plan) => {
            const credit = plan.creditPointsPerEuro > 0;
            const net = netAnnualValue(plan.id, widget.spend, credit);
            return (
              <article key={plan.id} className="rounded-[24px] border border-line bg-surface p-4">
                <h3 className="font-display text-2xl capitalize">{plan.id}</h3>
                <p className="num text-sm">{formatMoney(plan.monthlyFee)} / {t("fee")}</p>
                <p className="mt-2 text-sm">
                  {t("debit")}: {formatCount(monthlyPoints(plan.id, widget.spend, false))}
                </p>
                <p className="text-sm">
                  {t("credit")}: {credit ? formatCount(monthlyPoints(plan.id, widget.spend, true)) : "—"}
                </p>
                <p className={cn("num mt-2 text-sm", net > 0 ? "text-saving" : "text-ink-muted")}>
                  {t("net")}: {formatMoney(net)}
                </p>
              </article>
            );
          })}
        </div>
        <p className="mt-3 text-sm">
          {advice.id ? t("best", { plan: advice.id }) : t("nonePays")}
        </p>
        <SampleNote className="mt-2" />
      </Frame>
    );
  }

  if (widget.type === "earn") {
    const gap = pointsGap(widget.targetPoints, widget.ownedPoints);
    return (
      <Frame frozen={widget.frozen}>
        <article className="rounded-[24px] border border-line bg-surface p-5">
          <p className="text-xs text-ink-muted">{widget.targetDate}</p>
          <p className="mt-2 font-display text-3xl">
            <FlipNumber value={`${formatCount(widget.ownedPoints)} → ${formatCount(widget.targetPoints)}`} />
          </p>
          <p className="mt-2 text-sm">{t("gap")}: {formatCount(gap)}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-saving"
              style={{ width: `${Math.min(100, (widget.ownedPoints / Math.max(widget.targetPoints, 1)) * 100)}%` }}
            />
          </div>
          <p className={cn("mt-3 text-sm", widget.extraSpend ? "text-warn" : "text-saving")}>
            {widget.extraSpend ? t("extraWarn") : t("noExtra")}
          </p>
          <SampleNote className="mt-2" />
        </article>
      </Frame>
    );
  }

  if (widget.type === "booster") {
    const boosted = widget.spend * widget.multiplier;
    return (
      <Frame frozen={widget.frozen}>
        <article className="rounded-[24px] border border-line bg-surface p-5">
          <h3 className="font-display text-2xl">{widget.merchant}</h3>
          <p className="mt-2 text-sm">
            {t("example", {
              spend: formatMoney(widget.spend),
              rate: widget.multiplier,
              boosted: formatCount(boosted),
              normal: formatCount(widget.spend),
            })}
          </p>
          <p className="mt-2 text-sm text-ink">{t("onlyIf")}</p>
          <p className="mt-2 text-xs text-ink-muted">{widget.lastVerified}</p>
          <SampleNote className="mt-2" />
        </article>
      </Frame>
    );
  }

  if (widget.type === "transfer") {
    const steps = [t("age"), t("names"), t("hub"), t("qatar")];
    return (
      <TransferBlock steps={steps} from={widget.fromProgram} to={widget.toProgram} amount={widget.amount} />
    );
  }

  if (widget.type === "confirm") {
    const target = fare.store.board[0]?.points ?? 0;
    const owned = fare.store.wallet.reduce((sum, program) => sum + program.balance, 0);
    const gap = widget.gapPoints ?? pointsGap(target, owned);
    return (
      <ConfirmActionCard
        action={widget.action}
        summary={widget.summary}
        amountLabel={widget.amountLabel}
        reversible={widget.reversible}
        availabilityShown={availabilityShown}
        userConfirmed={availabilityConfirmed}
        gapPoints={gap}
        onConfirm={() => onConfirmAction?.(widget.action)}
      />
    );
  }

  if (widget.type === "usage") {
    return (
      <article className="rounded-[24px] border border-warn bg-surface p-5">
        <h3 className="font-display text-2xl">
          {widget.used}/{widget.limit}
        </h3>
        <p className="mt-2 text-sm">{t("limitBody", { feature: widget.feature })}</p>
        <Button type="button" className="mt-4" render={<Link href="/pricing" />}>
          {t("upgrade")}
        </Button>
      </article>
    );
  }

  return null;
}

function TransferBlock({
  steps,
  from,
  to,
  amount,
}: {
  steps: string[];
  from: string;
  to: string;
  amount: number;
}) {
  const t = useTranslations("widgets");
  const [done, setDone] = useState<boolean[]>(steps.map(() => false));
  return (
    <article className="rounded-[24px] border border-line bg-surface p-5">
      <h3 className="font-display text-2xl">{t("prereq")}</h3>
      <p className="mt-1 text-sm text-ink-muted">
        {from} → {to} · {formatCount(amount)}
      </p>
      <ul className="mt-3 space-y-2">
        {steps.map((step, index) => (
          <li key={step}>
            <button
              type="button"
              className="min-h-11 text-left text-sm"
              onClick={() => setDone((current) => current.map((item, i) => (i === index ? !item : item)))}
            >
              {done[index] ? "✓ " : "○ "}
              {step}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-muted">{t("markDone")}</p>
    </article>
  );
}
