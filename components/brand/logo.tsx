import { Link } from "@/i18n/navigation";
import { Mark, type MarkVariant } from "@/components/brand/mark";
import { siteConfig } from "@/lib/site-config";
import { cn } from "cn";

type LogoProps = {
  className?: string;
  /** `auto` swaps the mark between light and dark with the theme. */
  variant?: MarkVariant | "auto";
  wordmark?: boolean;
};

/** Wordmark plus the split-flap mark. */
export function Logo({ className, variant = "auto", wordmark = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-xl pr-1 text-ink",
        className,
      )}
      aria-label={`${siteConfig.name} home`}
    >
      {variant === "auto" ? (
        <>
          <Mark variant="light" className="dark:hidden" title="" />
          <Mark variant="dark" className="hidden dark:block" title="" />
        </>
      ) : (
        <Mark variant={variant} title="" />
      )}
      {wordmark ? (
        <span className="font-display text-[1.7rem] leading-none tracking-[-0.03em]">
          {siteConfig.name}
        </span>
      ) : null}
    </Link>
  );
}
