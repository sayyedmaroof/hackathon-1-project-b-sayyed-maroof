'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { ResultsFilterPanel } from '@/components/results-filter-panel'
import type { FlightFilters } from '@/lib/types'

export function FilterBottomSheet({
  open,
  filters,
  airlines,
  count,
  onChange,
  onReset,
  onClose,
}: {
  open: boolean
  filters: FlightFilters
  airlines: string[]
  count: number
  onChange: (filters: FlightFilters) => void
  onReset: () => void
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button type="button" className="absolute inset-0 bg-[#2a211b]/40" aria-label="Close filters" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter results"
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-3xl bg-[#f7f2e9] p-4 pb-6 shadow-2xl"
      >
        <div className="mb-3 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid min-h-11 min-w-11 place-items-center rounded-full border border-[#dfd2c4] bg-[#fffaf2]"
          >
            <X className="size-4" />
          </button>
        </div>
        <ResultsFilterPanel filters={filters} airlines={airlines} count={count} onChange={onChange} onReset={onReset} />
      </div>
    </div>
  )
}
