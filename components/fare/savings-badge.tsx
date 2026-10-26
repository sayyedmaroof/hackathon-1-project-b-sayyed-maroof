import { cn } from "cn";

/** The percentage saved. `--saving` is reserved for this kind of number. */
export function SavingsBadge({
  percent,
  className,
  size = "md",
}: {
  percent: number;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "saving-pulse num inline-flex items-center rounded-full border border-saving/30 bg-saving/10 font-medium text-saving",
        size === "lg" ? "px-4 py-2 text-2xl" : "px-3 py-1 text-sm",
        className,
      )}
    >
      −{Math.abs(Math.round(percent))}%
    </span>
  );
}
