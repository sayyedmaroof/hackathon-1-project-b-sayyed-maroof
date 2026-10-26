import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
};

/** Illustrated empty state. The ticket is drawn, not a stock image. */
export function EmptyState({ title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-5 rounded-[24px] border border-dashed border-line bg-surface px-6 py-10 md:px-10",
        className,
      )}
    >
      <svg viewBox="0 0 120 64" className="h-16 w-28 text-ink" aria-hidden="true">
        <rect
          x="4"
          y="8"
          width="112"
          height="48"
          rx="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M4 40h112" stroke="currentColor" strokeDasharray="3 3" />
        <circle cx="4" cy="40" r="5" className="fill-paper" stroke="currentColor" />
        <circle cx="116" cy="40" r="5" className="fill-paper" stroke="currentColor" />
        <path d="M18 22h28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 28h16" className="stroke-accent" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div>
        <h2 className="font-display text-3xl tracking-[-0.03em]">{title}</h2>
        <p className="mt-2 max-w-md text-ink-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}
