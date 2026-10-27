'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { airportLabel, filterAirports } from '@/lib/airports'
import type { Airport } from '@/lib/types'
import { cn } from '@/lib/utils'

export function AirportField({
  label,
  name,
  value,
  error,
  chrome,
  onChange,
  trailing,
}: {
  label: string
  name: string
  value: string
  error?: string
  chrome: 'field' | 'card'
  onChange: (value: string) => void
  trailing?: ReactNode
}) {
  const id = useId()
  const listId = `${id}-list`
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [box, setBox] = useState<{ top: number; left: number; width: number } | null>(null)
  const matches = filterAirports(value).slice(0, 8)

  useEffect(() => {
    if (!open || !inputRef.current) return
    function place() {
      const rect = inputRef.current?.getBoundingClientRect()
      if (!rect) return
      setBox({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 240) })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, value])

  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  function openList() {
    setOpen(true)
    const rect = inputRef.current?.getBoundingClientRect()
    if (!rect) return
    setBox({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 240) })
  }

  function choose(airport: Airport) {
    onChange(airportLabel(airport))
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openList()
      setActive((index) => Math.min(matches.length - 1, index + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      openList()
      setActive((index) => Math.max(0, index < 0 ? 0 : index - 1))
    } else if (event.key === 'Enter' && open && matches[active]) {
      event.preventDefault()
      choose(matches[active])
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div className="min-w-0" ref={rootRef}>
      <div className={cn(chrome === 'field' ? 'field' : 'input-card', 'relative')}>
        <span>{label}</span>
        <input
          ref={inputRef}
          aria-label={name}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `${id}-opt-${matches[active]?.code}` : undefined}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            openList()
            setActive(-1)
          }}
          onFocus={openList}
          onKeyDown={onKeyDown}
          className={cn('min-w-0', trailing && 'pr-10')}
        />
        {trailing}
      </div>
      {error && <p className="px-4 pt-1 text-xs text-[#9a4034]">{error}</p>}
      {open && box && (
        <ul
          id={listId}
          role="listbox"
          style={{ top: box.top, left: box.left, width: box.width }}
          className="fixed z-50 max-h-64 overflow-auto rounded-xl border border-[#e1d6c8] bg-[#fffdf9] py-1 shadow-lg"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[#8a796b]">No matching airports</li>
          ) : (
            matches.map((airport, index) => (
              <li key={airport.code} id={`${id}-opt-${airport.code}`} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(airport)}
                  className={cn('block w-full px-3 py-2 text-left', index === active && 'bg-[#f0e8dc]')}
                >
                  <span className="block text-sm font-semibold">
                    {airport.city} ({airport.code})
                  </span>
                  <span className="block text-xs text-[#8a796b]">
                    {airport.name} · {airport.country}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
