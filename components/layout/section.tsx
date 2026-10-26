import { Container } from "@/components/layout/container";
import { cn } from "cn";

type SectionProps = {
  id?: string;
  className?: string;
  containerClassName?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
};

/** Vertical rhythm for marketing sections. */
export function Section({
  id,
  className,
  containerClassName,
  eyebrow,
  title,
  description,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-20 md:py-28", className)}>
      <Container className={containerClassName}>
        {eyebrow || title || description ? (
          <header className="mb-10 max-w-2xl md:mb-14">
            {eyebrow ? (
              <p className="mb-3 text-xs font-medium tracking-[0.16em] text-accent uppercase">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] tracking-[-0.03em] text-balance">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
                {description}
              </p>
            ) : null}
          </header>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
