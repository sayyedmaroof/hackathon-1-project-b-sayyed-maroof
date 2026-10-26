"use client";

import { useTranslations } from "next-intl";
import { SHOW_SAMPLE_BADGE } from "@/lib/mock/flag";
import { cn } from "@/lib/utils";

/** Small label wherever a figure is illustrative, not live. */
export function SampleNote({ className }: { className?: string }) {
  const t = useTranslations("common");
  if (!SHOW_SAMPLE_BADGE) return null;
  return <p className={cn("text-xs tracking-wide text-ink-muted", className)}>{t("sample")}</p>;
}
