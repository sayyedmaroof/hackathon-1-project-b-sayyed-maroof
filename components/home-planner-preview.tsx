import { Sparkles } from 'lucide-react'
import { calculateSavings, formatEuro, formatPointsCompact } from '@/lib/savings'

export function HomePlannerPreview() {
  const plan = { title: 'Madrid → Tokyo', cash: 3000, fees: 860, points: 90000 }
  const savings = calculateSavings(plan)

  return (
    <div className="rounded-2xl bg-[#fffaf2] p-5 text-[#2a211b] shadow-2xl">
      <div className="flex items-center gap-3 border-b border-[#e8d7bf] pb-4">
        <span className="grid size-9 place-items-center rounded-full bg-[#ead2bc]">
          <Sparkles className="size-4 text-[#b86632]" />
        </span>
        <div>
          <p className="text-sm font-semibold">FareFlip</p>
          <p className="text-xs text-[#8a796b]">Your travel planner</p>
        </div>
        <span className="ml-auto size-2 rounded-full bg-[#86a77b]" />
      </div>
      <div className="flex flex-col gap-4 py-5 text-sm">
        <div className="ml-auto max-w-[78%] rounded-2xl rounded-br-sm bg-[#ead2bc] p-3">
          I want to fly business class to Tokyo this autumn, but I don&apos;t want to spend more than €1,000.
        </div>
        <div className="max-w-[86%] rounded-2xl rounded-bl-sm bg-[#f0e8dc] p-3 leading-6">
          That&apos;s a sample case for points. One option comes out to <strong>{formatEuro(plan.fees)}</strong> in fees and saves an estimated{' '}
          <strong>{formatEuro(savings.netSaving)}</strong> versus the cash fare.
        </div>
        <div className="rounded-xl border border-[#e8d7bf] p-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{plan.title}</span>
            <span className="status">{savings.netSaving >= 0 ? 'Use points' : 'Pay cash'}</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <span className="text-2xl font-semibold">{formatEuro(plan.fees)}</span>
              <span className="ml-1 text-xs text-[#8a796b]">+ {formatPointsCompact(plan.points)} Avios</span>
            </div>
            <span className="text-sm font-semibold text-[#b86632]">Save {formatEuro(savings.netSaving)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
