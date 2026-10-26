import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <Container className="space-y-6 py-16">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-20 w-full max-w-xl" />
      <Skeleton className="h-64 w-full rounded-[24px]" />
    </Container>
  );
}
