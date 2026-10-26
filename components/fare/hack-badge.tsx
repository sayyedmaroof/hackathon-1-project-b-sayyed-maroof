import { listHacks } from "@/lib/api/content";
import type { Hack } from "@/lib/types";
import { cn } from "cn";

const labels = new Map(listHacks().map((hack) => [hack.slug, hack.name]));

/** Short name of a hack, as a pill. */
export function HackBadge({ hack, className }: { hack: Hack; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border border-line bg-paper px-3 text-xs text-ink",
        className,
      )}
    >
      {labels.get(hack) ?? hack}
    </span>
  );
}
