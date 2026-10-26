import { Container } from "@/components/layout/container";
import { TripAward } from "@/components/trip/trip-award";
import { balanceAwards, jnbAwards, nowAwards } from "@/lib/agent/fixtures";

export function generateStaticParams() {
  return [...jnbAwards, ...balanceAwards, ...nowAwards].map((award) => ({ id: award.id }));
}

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Container className="py-8">
      <TripAward id={id} />
    </Container>
  );
}
