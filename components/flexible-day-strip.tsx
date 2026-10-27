'use client'

import { formatEuro } from '@/lib/savings'
import type { FlexibleDay } from '@/lib/types'
import { cn } from '@/lib/utils'

export function FlexibleDayStrip({
  days,
  selected,
  onPick,
}: {
  days: FlexibleDay[]
  selected: string
  onPick: (date: string) => void
}) {
  if (days.length === 0) return null

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#a39182]">Flexible dates</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => onPick(day.date)}
            className={cn(
              'min-h-11 min-w-24 shrink-0 rounded-xl border px-3 py-2 text-left',
              day.date === selected ? 'border-[#b86632] bg-[#fffaf2]' : 'border-[#e1d6c8] bg-[#fffdf9]',
            )}
          >
            <span className="block text-xs text-[#8a796b]">{day.label}</span>
            <strong className="text-sm">
              {day.date === selected ? 'Selected' : `${day.delta > 0 ? '+' : ''}${formatEuro(day.delta)}`}
            </strong>
          </button>
        ))}
      </div>
    </div>
  )
}
