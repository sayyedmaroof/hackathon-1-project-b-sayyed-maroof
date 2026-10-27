export function ResultSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="result-card animate-pulse">
          <div className="flex justify-between">
            <div className="h-10 w-32 rounded-xl bg-[#ead2bc]" />
            <div className="h-6 w-24 rounded-full bg-[#e4ecd9]" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="h-12 rounded-lg bg-[#f0e8dc]" />
            <div className="h-12 rounded-lg bg-[#f0e8dc]" />
            <div className="h-12 rounded-lg bg-[#ead2bc]" />
            <div className="h-12 rounded-lg bg-[#ead2bc]" />
          </div>
        </div>
      ))}
    </div>
  )
}
