"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/layout/empty-state";
import { PhotoMast } from "@/components/layout/photo-mast";
import { SampleNote } from "@/components/layout/sample-note";
import { SavedTripCard } from "@/components/trips/saved-trip-card";
import { TotalSavedCounter } from "@/components/trips/total-saved-counter";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useFareStore } from "@/hooks/use-fare-store";
import { formatCount } from "@/lib/format";

export function TripsLibrary() {
  const t = useTranslations("pages");
  const fare = useFareStore();
  const saved = fare.store.board.reduce((sum, item) => sum + (item.cashPrice - item.taxes), 0);
  const needed = fare.store.board.reduce((sum, item) => sum + item.points, 0);
  const owned = fare.store.wallet.reduce((sum, program) => sum + program.balance, 0);

  return (
    <div>
      <PhotoMast id="cape" />
      <h1 className="font-display text-4xl tracking-tight">{t("tripsTitle")}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t("value")}</p>
      <div className="mt-2">
        <TotalSavedCounter amount={saved} />
      </div>
      <p className="mt-1 text-sm">
        {formatCount(owned)} / {formatCount(needed)}
      </p>
      <SampleNote className="mt-2" />
      {fare.store.board.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t("tripsEmpty")} body={t("tripsEmpty")} action={<Button render={<Link href="/chat" />}>{t("seeChat")}</Button>} />
        </div>
      ) : (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {fare.store.board.map((item) => (
            <SavedTripCard
              key={item.id}
              id={item.optionId}
              route={item.route}
              cabin={item.cabin}
              points={item.points}
              taxes={item.taxes}
              cashPrice={item.cashPrice}
              onRemove={(optionId) =>
                fare.update((current) => ({
                  ...current,
                  board: current.board.filter((row) => row.optionId !== optionId),
                }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
