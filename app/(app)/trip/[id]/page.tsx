import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { SkeletonResult } from "@/components/fare/skeleton-result";
import { TripView } from "@/components/trip/trip-view";
import { findOption, listKnownOptionIds } from "@/lib/api/content";

export function generateStaticParams() {
  return listKnownOptionIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const option = findOption(id);
  if (!option) return { title: "Trip" };
  return {
    title: `${option.origin} to ${option.destination}`,
    description: option.whyItWorks,
  };
}

async function TripLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripView id={id} initial={findOption(id)} />;
}

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Container className="py-8 md:py-12">
      <Suspense fallback={<SkeletonResult />}>
        <TripLoader params={params} />
      </Suspense>
    </Container>
  );
}
