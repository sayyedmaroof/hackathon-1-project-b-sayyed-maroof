import type { Risk } from "@/lib/types";
import { cn } from "cn";

const copy: Record<Risk, { label: string; hint: string; className: string }> = {
  low: {
    label: "Low risk",
    hint: "A normal booking, with a small change of date or airport.",
    className: "border-line text-ink",
  },
  medium: {
    label: "Medium risk",
    hint: "Separate tickets or a longer day. A delay is yours to manage.",
    className: "border-warn/40 bg-warn/10 text-ink",
  },
  high: {
    label: "High risk",
    hint: "Points move one way, and the seat can disappear while they do.",
    className: "border-risk/40 bg-risk/10 text-ink",
  },
};

/** Risk is ink, warn, or risk — never the savings green. */
export function RiskLabel({ risk, className }: { risk: Risk; className?: string }) {
  const item = copy[risk];
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-medium",
        item.className,
        className,
      )}
      title={item.hint}
    >
      {item.label}
    </span>
  );
}
