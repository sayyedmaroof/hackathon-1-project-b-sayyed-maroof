"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/layout/empty-state";
import { SampleNote } from "@/components/layout/sample-note";
import { SavedTripCard } from "@/components/trips/saved-trip-card";
import { TotalSavedCounter } from "@/components/trips/total-saved-counter";
import { Button } from "@/components/ui/button";
import { useSavedTrips } from "@/hooks/use-saved-trips";

/** Saved trips, including the empty state. */
export function TripsBoard() {
  const { trips, ready, totalSaved, remove } = useSavedTrips();

  return (
    <Container className="py-8 md:py-12">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">Saved</p>
      <h1 className="mt-2 font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] tracking-[-0.04em]">
        Total saved
      </h1>
      <TotalSavedCounter amount={ready ? totalSaved : 0} />
      <SampleNote className="mt-2" />
      {!ready ? <p className="mt-8 text-sm text-ink-muted">Opening your trips…</p> : null}
      {ready && trips.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing saved yet."
            body="Flip a fare, then keep it here. Alerts stay on this device for now."
            action={<Button render={<Link href="/plan" />}>Check a trip</Button>}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <SavedTripCard key={trip.id} trip={trip} onRemove={remove} />
          ))}
        </div>
      )}
    </Container>
  );
}
