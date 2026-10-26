"use client";

import { useTranslations } from "next-intl";
import { SampleNote } from "@/components/layout/sample-note";
import { ProgramCard } from "@/components/wallet/program-card";
import { useFareStore } from "@/hooks/use-fare-store";
import { formatCount, formatMoney } from "@/lib/format";
import { transferRules } from "@/lib/mock/reference";

export function WalletBridge() {
  const t = useTranslations("pages");
  const widgets = useTranslations("widgets");
  const fare = useFareStore();
  const total = fare.store.wallet.reduce((sum, program) => sum + program.balance, 0);

  const nextTrip = fare.store.board[0]?.points ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl tracking-tight">{t("walletTitle")}</h1>
      <p className="num text-4xl">{formatCount(total)}</p>
      <p className="text-sm text-ink-muted">{formatMoney(total * 0.012)}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {fare.store.wallet.map((program) => (
          <div key={program.id} className="space-y-3">
            <ProgramCard
              program={{
                id: program.id,
                name: program.name,
                kind: "airline",
                balance: program.balance,
                expiry: program.expiry,
                euroValue: program.euroValue,
                nextTripCost: nextTrip || program.balance,
                unit: program.unit,
              }}
            />
            <label className="block text-sm">
              {t("manual")}
              <input
                className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
                inputMode="numeric"
                value={program.balance}
                onChange={(event) => fare.setWalletBalance(program.id, Number(event.target.value) || 0)}
              />
            </label>
          </div>
        ))}
      </div>
      <article className="rounded-[24px] border border-line p-4 text-sm">
        <p>{t("bridge")}</p>
        <p className="mt-2">{transferRules.source}</p>
        <p className="mt-2">{widgets("age")}</p>
        <SampleNote className="mt-2" />
      </article>
    </div>
  );
}
