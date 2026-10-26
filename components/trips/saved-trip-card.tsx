"use client";

import Link from "next/link";
import { BoardingPassCard } from "@/components/fare/boarding-pass";
import { RiskLabel } from "@/components/fare/risk-label";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/use-preferences";
import { formatMoney, formatSaving } from "@/lib/format";
import type { SavedTrip } from "@/lib/types";

/** A saved trip, with the alert state and the saving still visible. */
export function SavedTripCard({
  trip,
  onRemove,
}: {
  trip: SavedTrip;
  onRemove: (id: string) => void;
}) {
  const { prefs } = usePreferences();
  const option = trip.snapshot;
  return (
    <BoardingPassCard
      stub={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">{trip.alert ? "Alert on" : "Alert off"}</p>
          <button type="button" className="min-h-11 text-sm text-risk" onClick={() => onRemove(trip.id)}>
            Remove
          </button>
        </div>
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl tracking-tight">
            {option.origin} → {option.destination}
          </h2>
          <p className="num mt-2 text-saving">{formatSaving(option.saving, prefs.currency)}</p>
          <p className="num text-sm text-ink-muted line-through">
            {formatMoney(option.normalPrice, prefs.currency)}
          </p>
        </div>
        <RiskLabel risk={option.risk} />
      </div>
      <p className="mt-3 text-xs text-ink-muted">Sample price is unchanged since you saved it.</p>
      <Button className="mt-4" variant="outline" render={<Link href={`/trip/${trip.id}`} />}>
        Open
      </Button>
    </BoardingPassCard>
  );
}
