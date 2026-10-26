"use client";

import { useState } from "react";
import Link from "next/link";
import { BoardingPassCard } from "@/components/fare/boarding-pass";
import { HackBadge } from "@/components/fare/hack-badge";
import { PriceCompare } from "@/components/fare/price-compare";
import { RiskLabel } from "@/components/fare/risk-label";
import { TotalCostBreakdown } from "@/components/fare/total-cost-breakdown";
import { WhyItWorks } from "@/components/fare/why-it-works";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatExtraTime, formatDuration } from "@/lib/format";
import type { Option } from "@/lib/types";

/** One hack in the comparison list, with the legs and the true total tucked inside. */
export function HackCard({ option, featured = false }: { option: Option; featured?: boolean }) {
  const [openLegs, setOpenLegs] = useState(false);

  return (
    <BoardingPassCard
      className={featured ? "border-accent/40" : undefined}
      stub={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <WhyItWorks text={option.whyItWorks} />
          <Button variant="outline" render={<Link href={`/trip/${option.id}`} />}>
            Open this trip
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {option.hacks.map((hack) => (
          <HackBadge key={hack} hack={hack} />
        ))}
        <RiskLabel risk={option.risk} />
      </div>
      <div className="mt-4">
        <PriceCompare
          normal={option.normalPrice}
          hacked={option.hackedPrice}
          percent={option.savingPct}
          size={featured ? "lg" : "md"}
        />
      </div>
      <p className="num mt-3 text-sm text-ink-muted">
        {formatDuration(option.durationMinutes)} · {formatExtraTime(option.extraMinutes)} ·{" "}
        {option.stops === 0 ? "Nonstop" : `${option.stops} stop`}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="ghost" onClick={() => setOpenLegs((open) => !open)}>
          {openLegs ? "Hide legs" : "Show legs"}
        </Button>
        <Drawer>
          <DrawerTrigger
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm"
            aria-label="Show true total cost"
          >
            True total
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>True total cost</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <TotalCostBreakdown lines={option.costBreakdown} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      {openLegs ? (
        <ol className="mt-4 space-y-3 border-t border-dashed border-line pt-4">
          {option.legs.map((leg) => (
            <li key={`${leg.flightNumber}-${leg.departAt}`} className="text-sm">
              <p className="font-medium">
                {leg.from} → {leg.to}
              </p>
              <p className="text-ink-muted">
                {leg.carrier} {leg.flightNumber} · {formatDuration(leg.durationMinutes)}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </BoardingPassCard>
  );
}
