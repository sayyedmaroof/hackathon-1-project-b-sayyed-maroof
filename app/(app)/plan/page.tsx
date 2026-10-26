import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanForm } from "@/components/plan/plan-form";
import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Plan a trip",
  description: "One route, or a full plan. Fareflip flips the fare either way.",
};

export default function PlanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Container className="py-8 md:py-12">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">Plan</p>
      <h1 className="mt-2 max-w-xl font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] tracking-[-0.04em]">
        Tell us the trip. <span className="italic">We will flip the fare.</span>
      </h1>
      <p className="mt-3 max-w-lg text-ink-muted">
        Quick if you know the route. Full if there are stops. Either way, the saving is the answer.
      </p>
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-80 rounded-[24px]" />}>
          <PlanForm searchParams={searchParams} />
        </Suspense>
      </div>
    </Container>
  );
}
