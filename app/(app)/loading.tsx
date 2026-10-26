import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <Container className="space-y-4 py-8">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-40 w-full rounded-[24px]" />
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-28 rounded-[20px]" />
        <Skeleton className="h-28 rounded-[20px]" />
      </div>
    </Container>
  );
}
