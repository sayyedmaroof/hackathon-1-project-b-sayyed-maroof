import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

type StatusScreenProps = {
  eyebrow: string;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
};

/** Shared layout for loading, empty, missing, and broken routes. */
export function StatusScreen({
  eyebrow,
  title,
  body,
  actionHref = "/",
  actionLabel = "Back home",
}: StatusScreenProps) {
  return (
    <Container className="flex flex-1 flex-col justify-center py-20">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 max-w-xl font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.04em]">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-ink-muted">{body}</p>
      <div className="mt-8">
        <Button render={<Link href={actionHref} />}>{actionLabel}</Button>
      </div>
    </Container>
  );
}
