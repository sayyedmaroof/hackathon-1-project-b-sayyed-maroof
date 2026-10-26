import { cn } from "@/lib/utils";

type BoardingPassCardProps = {
  children: React.ReactNode;
  stub?: React.ReactNode;
  className?: string;
};

/** Ticket card with side notches and a perforated tear line. */
export function BoardingPassCard({ children, stub, className }: BoardingPassCardProps) {
  return (
    <article
      className={cn(
        "relative rounded-[24px] border border-line bg-surface shadow-elevated",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-[58%] -left-3 size-6 -translate-y-1/2 rounded-full border border-line bg-paper"
      />
      <span
        aria-hidden="true"
        className="absolute top-[58%] -right-3 size-6 -translate-y-1/2 rounded-full border border-line bg-paper"
      />
      <div className="px-5 py-5 md:px-6">{children}</div>
      {stub ? (
        <div className="border-t border-dashed border-line px-5 py-4 md:px-6">{stub}</div>
      ) : null}
    </article>
  );
}
