import { Container } from "@/components/layout/container";
import { TripsLibrary } from "@/components/trips/trips-library";

export default function TripsPage() {
  return (
    <Container className="py-8">
      <TripsLibrary />
    </Container>
  );
}
