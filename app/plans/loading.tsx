import { Skeleton } from '@/components/ui/skeleton'

export default function PlansLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  )
}
