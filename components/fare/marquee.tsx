"use client";

import { SampleNote } from "@/components/layout/sample-note";
import { usePreferences } from "@/hooks/use-preferences";
import { listTicker } from "@/lib/api/content";
import { formatSaving } from "@/lib/format";

/** A slow strip of recent sample savings. */
export function Marquee() {
  const { prefs } = usePreferences();
  const items = listTicker();
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-line bg-surface/80">
      <div className="flex items-center gap-4 px-5 py-2">
        <SampleNote className="shrink-0" />
        <div className="overflow-hidden">
          <div className="marquee-track flex w-max gap-8">
            {loop.map((item, index) => (
              <p key={`${item.id}-${index}`} className="text-sm whitespace-nowrap text-ink-muted">
                Someone just saved{" "}
                <span className="num text-saving">{formatSaving(item.saving, prefs.currency)}</span>{" "}
                on {item.route}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
