"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { transferAllowed, buyPointsAllowed } from "@/lib/agent/gates";

/** Consequential action. Transfer and buy stay disabled until availability is shown and confirmed. */
export function ConfirmActionCard({
  action,
  summary,
  amountLabel,
  reversible,
  availabilityShown,
  userConfirmed,
  gapPoints = 0,
}: {
  action: "transfer" | "buy" | "alert" | "upgrade";
  summary: string;
  amountLabel: string;
  reversible: boolean;
  availabilityShown: boolean;
  userConfirmed: boolean;
  gapPoints?: number;
}) {
  const t = useTranslations("widgets");
  const common = useTranslations("common");
  const gated = action === "transfer" || action === "buy";
  const allowed = !gated
    ? true
    : action === "buy"
      ? buyPointsAllowed({ availabilityShown, userConfirmed, gapPoints })
      : transferAllowed({ availabilityShown, userConfirmed });

  return (
    <article className="rounded-[24px] border border-line bg-surface p-5">
      <h3 className="font-display text-2xl">{t("whatHappens")}</h3>
      <p className="mt-2 text-sm">{summary}</p>
      <p className="num mt-2">{amountLabel}</p>
      {!reversible ? <p className="mt-2 text-sm text-risk">{t("irreversible")}</p> : null}
      {gated && !allowed ? <p className="mt-2 text-sm text-warn">{t("locked")}</p> : null}
      <Button type="button" className="mt-4" disabled={!allowed}>
        {common("confirm")}
      </Button>
    </article>
  );
}
