"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BoardingPassCard } from "@/components/fare/boarding-pass";
import { HackBadge } from "@/components/fare/hack-badge";
import { PriceCompare } from "@/components/fare/price-compare";
import { RiskLabel } from "@/components/fare/risk-label";
import { RouteMap } from "@/components/fare/route-map";
import { TotalCostBreakdown } from "@/components/fare/total-cost-breakdown";
import { WhyItWorks } from "@/components/fare/why-it-works";
import { EmptyState } from "@/components/layout/empty-state";
import { BookingStepper } from "@/components/trip/booking-stepper";
import { PriceAlertToggle } from "@/components/trip/price-alert-toggle";
import { Timeline } from "@/components/trip/timeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePreferences } from "@/hooks/use-preferences";
import { useSavedTrips } from "@/hooks/use-saved-trips";
import { formatCount, formatMoney } from "@/lib/format";
import type { Option } from "@/lib/types";

/** Detail page. Uses the catalog when it can, and a saved snapshot when it must. */
export function TripView({ id, initial }: { id: string; initial: Option | null }) {
  const saved = useSavedTrips();
  const { prefs } = usePreferences();
  const option = initial ?? (saved.ready ? saved.find(id) : null);
  const [booked, setBooked] = useState(false);
  const [reference] = useState("FF-4821");

  if (!saved.ready && !initial) {
    return <p className="text-sm text-ink-muted">Looking for this trip…</p>;
  }

  if (!option) {
    return (
      <EmptyState
        title="This trip isn't on file."
        body="It isn't in the sample catalog, and it isn't saved on this device."
        action={<Button render={<Link href="/plan" />}>Plan it again</Button>}
      />
    );
  }

  const alertOn = saved.trips.find((trip) => trip.id === option.id)?.alert ?? false;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Fareflip", url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-6">
        <BoardingPassCard>
          <div className="flex flex-wrap items-center gap-2">
            {option.hacks.map((hack) => (
              <HackBadge key={hack} hack={hack} />
            ))}
            <RiskLabel risk={option.risk} />
          </div>
          <h1 className="mt-4 font-display text-5xl tracking-[-0.04em]">
            {option.origin} → {option.destination}
          </h1>
          <div className="mt-4">
            <PriceCompare
              normal={option.normalPrice}
              hacked={option.hackedPrice}
              percent={option.savingPct}
              size="lg"
            />
          </div>
        </BoardingPassCard>
        <section className="rounded-[24px] border border-line bg-surface p-5">
          <h2 className="font-display text-3xl">Why this works</h2>
          <div className="mt-3">
            <WhyItWorks text={option.whyItWorks} />
          </div>
          <div className="mt-4 h-40">
            <RouteMap
              pairs={option.legs.map((leg) => ({ from: leg.from, to: leg.to }))}
              label={`Route from ${option.origin} to ${option.destination}`}
            />
          </div>
        </section>
        <section className="rounded-[24px] border border-line bg-surface p-5">
          <h2 className="font-display text-3xl">Itinerary</h2>
          <div className="mt-4">
            <Timeline legs={option.legs} />
          </div>
        </section>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-[24px] border border-line bg-surface p-5">
          <h2 className="font-display text-3xl">Book it</h2>
          <div className="mt-4">
            <TotalCostBreakdown lines={option.costBreakdown} />
          </div>
          <Button type="button" className="mt-5 w-full" onClick={() => setBooked(true)}>
            Book this flight
          </Button>
          <div className="mt-6">
            <BookingStepper hacks={option.hacks} />
          </div>
        </div>
        <div className="rounded-[24px] border border-line p-5">
          <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">Best card to book with</p>
          <p className="mt-2 font-display text-2xl">{option.bestCard.name}</p>
          <p className="mt-1 text-sm text-ink-muted">{option.bestCard.reason}</p>
          <p className="num mt-3 text-sm text-saving">
            {formatCount(option.bestCard.pointsEarned)} pts ·{" "}
            {formatMoney(option.bestCard.euroValue, prefs.currency)}
          </p>
        </div>
        <PriceAlertToggle
          checked={alertOn}
          signal={option.waitSignal}
          onChange={(checked) => {
            if (!saved.isSaved(option.id)) saved.save(option);
            saved.toggleAlert(option.id, checked);
          }}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => saved.save(option)}
            disabled={saved.isSaved(option.id)}
          >
            {saved.isSaved(option.id) ? "Saved" : "Save trip"}
          </Button>
          <Button type="button" variant="outline" onClick={() => void share()}>
            Share
          </Button>
        </div>
      </aside>
      <Dialog open={booked} onOpenChange={setBooked}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You are booked. In this preview.</DialogTitle>
            <DialogDescription>
              Reference {reference}. No ticket was issued. The fare you would have paid is{" "}
              {formatMoney(option.hackedPrice, prefs.currency)}.
            </DialogDescription>
          </DialogHeader>
          <Button type="button" onClick={() => setBooked(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
