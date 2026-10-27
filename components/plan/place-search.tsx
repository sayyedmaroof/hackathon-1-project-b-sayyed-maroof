'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { searchPlaces } from '@/app/actions/places'
import type { PlaceHit } from '@/lib/plan/places'

export function PlaceSearch({
  label,
  city,
  iata,
  onPick,
}: {
  label: string
  city: string
  iata: string
  onPick: (hit: PlaceHit) => void
}) {
  const listId = useId()
  const [query, setQuery] = useState(city && iata ? `${city} (${iata})` : city)
  const [hits, setHits] = useState<PlaceHit[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const req = useRef(0)

  useEffect(() => {
    const next = city && iata ? `${city} (${iata})` : city
    setQuery(next)
  }, [city, iata])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2 || (city && iata && q === `${city} (${iata})`)) {
      setHits([])
      return
    }
    const id = ++req.current
    const t = window.setTimeout(() => {
      setLoading(true)
      void searchPlaces(q)
        .then((rows) => {
          if (id !== req.current) return
          setHits(rows)
          setOpen(true)
        })
        .finally(() => {
          if (id === req.current) setLoading(false)
        })
    }, 280)
    return () => window.clearTimeout(t)
  }, [query, city, iata])

  return (
    <label className="relative text-sm font-semibold">
      {label}
      <input
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && hits.length > 0}
        aria-controls={listId}
        className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
        value={query}
        placeholder="Type a city or airport"
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (hits.length) setOpen(true)
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120)
        }}
      />
      {loading ? <p className="mt-1 text-xs text-[#76675c]">Searching…</p> : null}
      {open && hits.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[#e1d6c8] bg-[#fffaf2] py-1 shadow-lg"
        >
          {hits.map((hit) => (
            <li key={hit.iata}>
              <button
                type="button"
                role="option"
                className="flex min-h-11 w-full items-center justify-between px-3 text-left text-sm hover:bg-[#eee4d8]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(hit)
                  setQuery(`${hit.city} (${hit.iata})`)
                  setOpen(false)
                }}
              >
                <span>
                  {hit.city} · {hit.name}
                </span>
                <span className="font-semibold text-[#b86632]">{hit.iata}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </label>
  )
}
