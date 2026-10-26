"use client";

import { useTranslations } from "next-intl";
import { listPrograms } from "@/lib/api/content";

/** A slow strip of loyalty programs. It pauses on hover. */
export function Marquee() {
  const t = useTranslations("landing");
  const items = listPrograms();
  const loop = [...items, ...items];

  return (
    <div className="marquee-wrap overflow-hidden border-y border-line bg-surface/80">
      <div className="overflow-hidden py-3">
        <div className="marquee-track flex w-max gap-8">
          {loop.map((item, index) => (
            <p key={`${item.id}-${index}`} className="text-sm whitespace-nowrap text-ink-muted">
              <span className="sr-only">{t("programs")}</span>
              {item.name}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
