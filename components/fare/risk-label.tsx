"use client";

import { useTranslations } from "next-intl";
import type { Risk } from "@/lib/types";
import { cn } from "cn";

const tone: Record<Risk, string> = {
  low: "border-line text-ink",
  medium: "border-warn/40 bg-warn/10 text-ink",
  high: "border-risk/40 bg-risk/10 text-ink",
};

/** Risk is ink, warn, or risk — never the savings green. */
export function RiskLabel({ risk, className }: { risk: Risk; className?: string }) {
  const t = useTranslations("common");
  const label = risk === "low" ? t("riskLow") : risk === "medium" ? t("riskMedium") : t("riskHigh");
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-medium",
        tone[risk],
        className,
      )}
    >
      {label}
    </span>
  );
}
