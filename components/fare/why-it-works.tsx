"use client";

import { useTranslations } from "next-intl";

/** One plain sentence on why this fare is lower. */
export function WhyItWorks({ text }: { text: string }) {
  const t = useTranslations("common");
  return (
    <p className="text-sm leading-relaxed text-ink-muted">
      <span className="font-medium text-ink">{t("why")}. </span>
      {text}
    </p>
  );
}
