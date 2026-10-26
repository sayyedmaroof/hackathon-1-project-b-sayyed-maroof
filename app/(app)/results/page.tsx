import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { ResultsExplorer } from "@/components/results/results-explorer";
import { SkeletonResult } from "@/components/fare/skeleton-result";
import { parseTripQuery } from "@/lib/query";

export const metadata: Metadata = {
  title: "Flipped fares",
  description: "The normal price, the hacked price, and why the saving works.",
};

function ResultsBody({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ResultsGate searchParams={searchParams} />;
}

async function ResultsGate({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") search.set(key, value);
    else if (value?.[0]) search.set(key, value[0]);
  }
  const query = parseTripQuery(search);
  return <ResultsExplorer query={query} />;
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Container className="py-8 md:py-12">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">Results</p>
      <h1 className="mt-2 font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] tracking-[-0.04em]">
        The saving, <span className="italic">in front.</span>
      </h1>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="space-y-3">
              <SkeletonResult />
              <SkeletonResult />
            </div>
          }
        >
          <ResultsBody searchParams={searchParams} />
        </Suspense>
      </div>
    </Container>
  );
}
