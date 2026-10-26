"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { assertTransferAllowed, transferAllowed, buyPointsAllowed } from "@/lib/agent/gates";

/** Consequential action. Transfer and buy stay disabled until availability is shown and confirmed. */
export function ConfirmActionCard({
  action,
  summary,
  amountLabel,
  reversible,
  availabilityShown,
  userConfirmed,
  gapPoints = 0,
  onConfirm,
}: {
  action: "transfer" | "buy" | "alert" | "upgrade";
  summary: string;
  amountLabel: string;
  reversible: boolean;
  availabilityShown: boolean;
  userConfirmed: boolean;
  gapPoints?: number;
  onConfirm: () => void;
}) {
  const t = useTranslations("widgets");
  const common = useTranslations("common");
  const fired = useRef(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [done, setDone] = useState(false);
  const gated = action === "transfer" || action === "buy";
  const gateAcknowledged = reversible || acknowledged;
  const allowed = !gated
    ? true
    : action === "buy"
      ? buyPointsAllowed({
          availabilityShown,
          userConfirmed,
          acknowledged: gateAcknowledged,
          gapPoints,
        })
      : transferAllowed({ availabilityShown, userConfirmed, acknowledged: gateAcknowledged });
  const locked = done || !allowed;

  function confirm() {
    if (fired.current || locked) return;
    if (action === "transfer") {
      assertTransferAllowed({
        availabilityShown,
        userConfirmed,
        acknowledged: gateAcknowledged,
      });
    }
    fired.current = true;
    setDone(true);
    toast.success(t("confirmed"));
    onConfirm();
  }

  return (
    <article className="rounded-[24px] border border-line bg-surface p-5">
      <h3 className="font-display text-2xl">{t("whatHappens")}</h3>
      <p className="mt-2 text-sm">{summary}</p>
      <p className="num mt-2">{amountLabel}</p>
      {!reversible ? <p className="mt-2 text-sm text-risk">{t("irreversible")}</p> : null}
      {gated && (!availabilityShown || !userConfirmed) && !done ? (
        <p className="mt-2 text-sm text-warn">{t("locked")}</p>
      ) : null}
      {!reversible ? (
        <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          {t("acknowledge")}
        </label>
      ) : null}
      {done ? <p className="mt-4 text-sm text-saving">{t("confirmed")}</p> : null}
      <Button type="button" className="mt-4" disabled={locked} onClick={confirm}>
        {common("confirm")}
      </Button>
    </article>
  );
}
