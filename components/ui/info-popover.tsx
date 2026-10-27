'use client'

import { useId, useState } from 'react'

export function InfoPopover({ term, children }: { term: string; children: string }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="min-h-11 min-w-11 text-left text-sm font-semibold text-primary underline decoration-dotted"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
      >
        {term}
      </button>
      {open ? (
        <span id={id} role="tooltip" className="absolute z-20 mt-1 w-64 rounded-xl border border-border bg-surface p-3 text-sm font-normal text-ink shadow-[var(--shadow-card)]">
          {children}
        </span>
      ) : null}
    </span>
  )
}
