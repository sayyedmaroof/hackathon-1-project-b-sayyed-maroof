import { formatDuration, formatTime } from "@/lib/format";
import type { Segment } from "@/lib/types";

/** Legs and layovers, top to bottom. Clock times stay hidden when the date has no time. */
export function Timeline({ legs }: { legs: Segment[] }) {
  return (
    <ol className="space-y-0">
      {legs.map((leg, index) => {
        const timed = /T\d{2}:\d{2}/.test(leg.departAt);
        return (
          <li key={`${leg.from}-${leg.to}-${leg.departAt}`} className="relative ps-6">
            <span className="absolute top-1 left-0 size-3 rounded-full bg-accent" aria-hidden="true" />
            {index < legs.length - 1 ? (
              <span className="absolute top-4 left-[5px] h-[calc(100%-0.25rem)] w-px bg-line" aria-hidden="true" />
            ) : null}
            <p className="font-medium">
              {leg.from} → {leg.to}
            </p>
            <p className="text-sm text-ink-muted">
              {leg.carrier}
              {leg.flightNumber ? ` ${leg.flightNumber}` : ""}
              {timed
                ? ` · ${formatTime(leg.departAt)}–${formatTime(leg.arriveAt)} · ${formatDuration(leg.durationMinutes)}`
                : ` · ${leg.departAt}`}
            </p>
            {leg.layoverMinutes ? (
              <p className="mt-2 mb-4 text-xs text-ink-muted">{formatDuration(leg.layoverMinutes)}</p>
            ) : (
              <div className="mb-4" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
