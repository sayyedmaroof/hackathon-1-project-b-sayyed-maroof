"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import { HackCard } from "@/components/fare/hack-card";
import { PriceHeatmap } from "@/components/fare/price-heatmap";
import { SkeletonResult } from "@/components/fare/skeleton-result";
import { TimeValueSlider } from "@/components/fare/time-value-slider";
import { SampleNote } from "@/components/layout/sample-note";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { usePreferences } from "@/hooks/use-preferences";
import { useTripSearch } from "@/hooks/use-trip-search";
import { formatPricedAt } from "@/lib/format";
import { resultsHref } from "@/lib/query";
import type { Hack, Option, Risk, TripQuery } from "@/lib/types";
import Link from "next/link";

type SortKey = "cheapest" | "fastest" | "value";

const hackFilters: { id: Hack | "all"; label: string }[] = [
  { id: "all", label: "All hacks" },
  { id: "flexible-dates", label: "Dates" },
  { id: "nearby-airports", label: "Airports" },
  { id: "split-ticket", label: "Split" },
  { id: "stopover", label: "Stopover" },
  { id: "miles", label: "Miles" },
  { id: "transfer-partner", label: "Transfers" },
];

function effortScore(option: Option, euroPerHour: number) {
  return option.saving - (option.extraMinutes / 60) * euroPerHour;
}

/** Streaming comparison. Filters sit in a rail on desktop and a drawer on a phone. */
function withDepart(query: TripQuery, date: string): TripQuery {
  const legs = query.legs.map((leg, index) => {
    if (index !== 0) return leg;
    const returnDate =
      leg.returnDate && leg.returnDate < date
        ? new Date(Date.UTC(
            Number(date.slice(0, 4)),
            Number(date.slice(5, 7)) - 1,
            Number(date.slice(8, 10)) + 4,
          ))
            .toISOString()
            .slice(0, 10)
        : leg.returnDate;
    return { ...leg, depart: date, returnDate };
  });
  return { ...query, legs };
}

export function ResultsExplorer({ query }: { query: TripQuery | null }) {
  const router = useRouter();
  const search = useTripSearch(query);
  const { prefs } = usePreferences();
  const [sort, setSort] = useState<SortKey>("value");
  const [hack, setHack] = useState<Hack | "all">("all");
  const [risk, setRisk] = useState<Risk | "all">("all");
  const [timeValue, setTimeValue] = useState(prefs.timeValue);
  const [heatDate, setHeatDate] = useState<string | undefined>(query?.legs[0]?.depart);

  const pickHeatDate = (date: string) => {
    setHeatDate(date);
    if (!query) return;
    router.replace(resultsHref(withDepart(query, date)), { scroll: false });
  };

  const ranked = useMemo(() => {
    const filtered = search.options.filter((option) => {
      const hackOk = hack === "all" || option.hacks.includes(hack);
      const riskOk = risk === "all" || option.risk === risk;
      return hackOk && riskOk;
    });
    const copy = [...filtered];
    copy.sort((a, b) => {
      if (sort === "cheapest") return a.hackedPrice - b.hackedPrice;
      if (sort === "fastest") return a.durationMinutes - b.durationMinutes;
      return effortScore(b, timeValue) - effortScore(a, timeValue);
    });
    return copy;
  }, [hack, risk, search.options, sort, timeValue]);

  const best = ranked[0];
  const heatmap = search.options.find((option) => option.heatmap)?.heatmap;
  const pricedAt = search.options[0]?.pricedAt;
  const pending = Math.max(0, search.total - search.checked);

  if (!query) {
    return (
      <EmptyState
        title="No trip to flip yet."
        body="Start with a route. Or open the Madrid to Lisbon sample and see the six hacks land."
        action={
          <Button
            render={
              <Link href="/results?mode=quick&from=MAD&to=LIS&depart=2026-11-12&return=2026-11-16&travellers=1&cabin=economy&flex=3" />
            }
          >
            Load the sample
          </Button>
        }
      />
    );
  }

  const filters = (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">Sort</p>
        <div className="mt-2 flex flex-col gap-1">
          {(
            [
              ["value", "Best value"],
              ["cheapest", "Cheapest"],
              ["fastest", "Fastest"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={sort === id}
              className={`min-h-11 rounded-xl px-3 text-left text-sm ${sort === id ? "bg-ink text-paper" : ""}`}
              onClick={() => setSort(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">Hack</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {hackFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={hack === item.id}
              className={`min-h-11 rounded-full border px-3 text-sm ${hack === item.id ? "border-ink bg-ink text-paper" : "border-line"}`}
              onClick={() => setHack(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">Risk</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["all", "low", "medium", "high"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={risk === item}
              className={`min-h-11 rounded-full border px-3 text-sm capitalize ${risk === item ? "border-ink bg-ink text-paper" : "border-line"}`}
              onClick={() => setRisk(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <TimeValueSlider value={timeValue} onChange={setTimeValue} />
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside className="hidden lg:block">{filters}</aside>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm">
              {search.done
                ? `Checked ${search.total} of ${search.total} hacks`
                : `Checked ${search.checked} of ${search.total} hacks…`}
            </p>
            <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${(search.checked / search.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pricedAt ? <p className="text-xs text-ink-muted">{formatPricedAt(pricedAt)}</p> : null}
            <SampleNote />
            <Drawer>
              <DrawerTrigger className="inline-flex min-h-11 items-center rounded-xl border border-line px-3 text-sm lg:hidden">
                Filters
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Sort and filter</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-8">{filters}</div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {search.error ? <p className="text-sm text-risk">{search.error}</p> : null}

        {best ? <HackCard option={best} featured /> : <SkeletonResult />}

        <LayoutGroup>
          <div className="space-y-3">
            {ranked.slice(best ? 1 : 0).map((option) => (
              <motion.div key={option.id} layout>
                <HackCard option={option} />
              </motion.div>
            ))}
          </div>
        </LayoutGroup>

        {pending > 0
          ? Array.from({ length: Math.min(pending, 3) }).map((_, index) => (
              <SkeletonResult key={`pending-${index}`} />
            ))
          : null}

        {search.done && ranked.length === 0 ? (
          <EmptyState
            title="Nothing matches those filters."
            body="Widen the hack or the risk and the list comes back."
          />
        ) : null}

        {heatmap ? (
          <section className="rounded-[24px] border border-line bg-surface p-5">
            <h2 className="font-display text-3xl tracking-tight">Flexible dates</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Greener days are lower. Pick one to hold it against the result.
            </p>
            <div className="mt-4">
              <PriceHeatmap cells={heatmap} selected={heatDate} onSelect={pickHeatDate} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
