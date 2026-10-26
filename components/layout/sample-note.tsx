import { cn } from "cn";

/** Small label wherever a figure is illustrative, not live. */
export function SampleNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs tracking-wide text-ink-muted", className)}>
      Sample data
    </p>
  );
}
