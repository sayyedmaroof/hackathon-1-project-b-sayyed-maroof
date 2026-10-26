"use client";

import { useTranslations } from "next-intl";
import { BoardingPassCard } from "@/components/fare/boarding-pass";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatCount, formatMoney } from "@/lib/format";

/** A pinned award, with the cash fare still visible beside the points. */
export function SavedTripCard({
  id,
  route,
  cabin,
  points,
  taxes,
  cashPrice,
  onRemove,
}: {
  id: string;
  route: string;
  cabin: string;
  points: number;
  taxes: number;
  cashPrice: number;
  onRemove: (id: string) => void;
}) {
  const t = useTranslations("pages");
  const saved = cashPrice - taxes;

  return (
    <BoardingPassCard
      stub={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">{cabin}</p>
          <button type="button" className="min-h-11 text-sm text-risk" onClick={() => onRemove(id)}>
            {t("remove")}
          </button>
        </div>
      }
    >
      <h2 className="font-display text-3xl tracking-tight">{route}</h2>
      <p className="num mt-2 text-saving">{formatMoney(saved)}</p>
      <p className="num text-sm text-ink-muted line-through">{formatMoney(cashPrice)}</p>
      <p className="num mt-2 text-sm">
        {formatCount(points)} + {formatMoney(taxes)}
      </p>
      <Button className="mt-4" variant="outline" render={<Link href={`/trip/${id}`} />}>
        {t("seeChat")}
      </Button>
    </BoardingPassCard>
  );
}
