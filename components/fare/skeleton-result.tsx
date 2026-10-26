import { Skeleton } from "@/components/ui/skeleton";

/** A boarding-pass shaped placeholder while a hack is still being checked. */
export function SkeletonResult() {
  return (
    <div className="rounded-[24px] border border-line bg-surface p-5">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-10 w-48" />
      <Skeleton className="mt-3 h-4 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}
