"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/layout/empty-state";
import { SampleNote } from "@/components/layout/sample-note";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useFareStore } from "@/hooks/use-fare-store";
import { formatCount, formatMoney } from "@/lib/format";

export function TripsLibrary() {
  const t = useTranslations("pages");
  const widgets = useTranslations("widgets");
  const fare = useFareStore();
  const saved = fare.store.board.reduce((sum, item) => sum + Math.max(0, item.cashPrice - item.taxes), 0);
  const needed = fare.store.board.reduce((sum, item) => sum + item.points, 0);
  const owned = fare.store.wallet.reduce((sum, program) => sum + program.balance, 0);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">{t("tripsTitle")}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t("value")}</p>
      <p className="num mt-2 text-4xl text-saving">{formatMoney(saved)}</p>
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
            <article key={item.id} className="rounded-[24px] border border-line p-4">
              <h2 className="font-display text-2xl">{item.route}</h2>
              <p className="text-sm">{item.cabin}</p>
              <p className="num mt-2">{formatCount(item.points)} + {formatMoney(item.taxes)}</p>
              <p className="text-xs text-ink-muted">{widgets(`status${item.status === "researching" ? "Research" : item.status === "ready" ? "Ready" : item.status === "booked" ? "Booked" : "Idea"}`)}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" render={<Link href={`/trip/${item.optionId}`} />}>{t("seeChat")}</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard?.writeText(`${item.route} ${item.points}`);
                  }}
                >
                  {t("value")}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
