'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeftRight, Search } from 'lucide-react'
import { AirportField } from '@/components/airport-combobox'
import { Button } from '@/components/button'
import { DateField } from '@/components/date-field'
import { cabins, modes, searchExamples, travelers } from '@/lib/data'
import { formatRange } from '@/lib/dates'
import { useRouter } from 'next/navigation'
import { searchQueryToResultsUrl } from '@/lib/search/results-url'
import { validateSearch } from '@/lib/search'
import { useApp } from '@/lib/store'
import type { FlightOption, SearchErrors, SearchQuery } from '@/lib/types'
import { cn } from '@/lib/utils'

export function SearchFields({ variant }: { variant: 'hero' | 'page' }) {
  const router = useRouter()
  const { state, patchSearch } = useApp()
  const search = state.search
  const [errors, setErrors] = useState<SearchErrors>({})
  const [loading, setLoading] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  function submit(patch?: Partial<SearchQuery>) {
    if (loading) return
    const next: SearchQuery = { ...search, ...patch }
    next.when = formatRange(next.depart, next.returnDate)
    const found = validateSearch(next)
    setErrors(found)
    patchSearch(next)
    if (Object.keys(found).length > 0) return
    setLoading(true)
    timer.current = window.setTimeout(() => {
      setLoading(false)
      router.push(searchQueryToResultsUrl(next))
    }, 600)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  const fields = (
    <>
      {loading ? (
        <div className="grid gap-3 p-2" aria-hidden="true">
          <div className="h-16 animate-pulse rounded-2xl bg-[#f0e8dc]" />
          <div className="h-16 animate-pulse rounded-2xl bg-[#ead2bc]" />
          <div className="h-10 w-40 animate-pulse rounded-full bg-[#e5c9ad]" />
        </div>
      ) : variant === 'hero' ? (
        <HeroFields search={search} errors={errors} onPatch={patchSearch} onError={setErrors} loading={loading} />
      ) : (
        <PageFields search={search} errors={errors} onPatch={patchSearch} onError={setErrors} />
      )}
      {variant === 'page' && !loading && (
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#e8ddd1] pt-5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={search.flexible}
            onChange={(event) => patchSearch({ flexible: event.target.checked })}
            className="accent-[#b86632]"
          />
          Flexible dates <span className="rounded-full bg-[#ead2bc] px-2 py-0.5 text-[10px] text-[#8e522f]">Recommended</span>
        </label>
        <Button variant="terra" type="submit" disabled={loading}>
          {loading ? 'Searching…' : <>Search flights <Search className="size-4" /></>}
        </Button>
      </div>
      )}
    </>
  )

  return (
    <div>
      <form onSubmit={onSubmit} aria-busy={loading} className={variant === 'hero' ? 'relative z-10 mx-auto max-w-[1080px]' : 'panel mt-10 p-5 md:p-8'}>
        {variant === 'hero' ? (
          <div className="rounded-[22px] border border-[#e1d6c8] bg-[#fffdf9] p-2 shadow-[0_18px_60px_rgba(66,45,29,.13)] md:rounded-[28px] md:p-2.5">
            {fields}
            {!loading && (
              <div className="mt-2 grid items-center gap-3 px-1 pb-1 lg:grid-cols-[1fr_auto]">
                <OptionRow search={search} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={search.flexible}
                    onChange={(event) => patchSearch({ flexible: event.target.checked })}
                    className="accent-[#b86632]"
                  />
                  Flexible dates <span className="rounded-full bg-[#ead2bc] px-2 py-0.5 text-[10px] text-[#8e522f]">Recommended</span>
                </label>
              </div>
            )}
          </div>
        ) : (
          fields
        )}
      </form>
      {!loading && (
        <div className={cn(variant === 'hero' ? 'mx-auto mt-4 max-w-[1080px]' : 'mt-8')}>
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#a39182]">Try an example</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {searchExamples.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => submit(example.patch)}
                className="rounded-full border border-[#dfd2c4] bg-[#fffaf2] px-4 py-2 text-sm text-[#66584e] hover:border-[#b86632]"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function HeroFields({
  search,
  errors,
  onPatch,
  onError,
  loading,
}: {
  search: SearchQuery
  errors: SearchErrors
  onPatch: (patch: Partial<SearchQuery>) => void
  onError: (errors: SearchErrors) => void
  loading: boolean
}) {
  return (
    <div className="grid gap-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
      <AirportField
        label="From"
        name="Origin"
        value={search.origin}
        error={errors.origin}
        chrome="field"
        onChange={(origin) => {
          onPatch({ origin })
          onError({ ...errors, origin: undefined })
        }}
        trailing={
          <button
            type="button"
            aria-label="Swap origin and destination"
            onClick={() => onPatch({ origin: search.destination, destination: search.origin })}
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-[#dfd2c4] bg-[#fffdf9] text-[#b86632]"
          >
            <ArrowLeftRight className="size-3.5" />
          </button>
        }
      />
      <AirportField
        label="To"
        name="Destination"
        value={search.destination}
        error={errors.destination}
        chrome="field"
        onChange={(destination) => {
          onPatch({ destination })
          onError({ ...errors, destination: undefined })
        }}
      />
      <DateField
        label="Departure"
        name="Departure"
        value={search.depart}
        error={errors.depart}
        chrome="field"
        onChange={(depart) => {
          onPatch({ depart, when: formatRange(depart, search.returnDate) })
          onError({ ...errors, depart: undefined })
        }}
      />
      <DateField
        label="Return"
        name="Return"
        value={search.returnDate}
        error={errors.returnDate}
        chrome="field"
        onChange={(returnDate) => {
          onPatch({ returnDate, when: formatRange(search.depart, returnDate) })
          onError({ ...errors, returnDate: undefined })
        }}
      />
      <Button variant="terra" type="submit" className="rounded-[16px] md:rounded-full" disabled={loading}>
        {loading ? 'Searching…' : <><Search className="size-4" /> Search</>}
      </Button>
    </div>
  )
}

function PageFields({
  search,
  errors,
  onPatch,
  onError,
}: {
  search: SearchQuery
  errors: SearchErrors
  onPatch: (patch: Partial<SearchQuery>) => void
  onError: (errors: SearchErrors) => void
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <AirportField
          label="From"
          name="Origin"
          value={search.origin}
          error={errors.origin}
          chrome="card"
          onChange={(origin) => {
            onPatch({ origin })
            onError({ ...errors, origin: undefined })
          }}
          trailing={
            <button
              type="button"
              aria-label="Swap origin and destination"
              onClick={() => onPatch({ origin: search.destination, destination: search.origin })}
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-[#dfd2c4] bg-[#fffdf9] text-[#b86632]"
            >
              <ArrowLeftRight className="size-3.5" />
            </button>
          }
        />
        <AirportField
          label="To"
          name="Destination"
          value={search.destination}
          error={errors.destination}
          chrome="card"
          onChange={(destination) => {
            onPatch({ destination })
            onError({ ...errors, destination: undefined })
          }}
        />
        <DateField
          label="Departure"
          name="Departure"
          value={search.depart}
          error={errors.depart}
          chrome="card"
          onChange={(depart) => {
            onPatch({ depart, when: formatRange(depart, search.returnDate) })
            onError({ ...errors, depart: undefined })
          }}
        />
        <DateField
          label="Return"
          name="Return"
          value={search.returnDate}
          error={errors.returnDate}
          chrome="card"
          onChange={(returnDate) => {
            onPatch({ returnDate, when: formatRange(search.depart, returnDate) })
            onError({ ...errors, returnDate: undefined })
          }}
        />
      </div>
      <div className="mt-5">
        <OptionRow search={search} />
      </div>
    </>
  )
}

function OptionRow({ search }: { search: SearchQuery }) {
  const { patchSearch } = useApp()
  return (
    <div className="grid gap-2 md:grid-cols-3">
      <label className="input-card">
        <span>Travelers</span>
        <select aria-label="Travelers" value={search.travelers} onChange={(event) => patchSearch({ travelers: event.target.value })}>
          {travelers.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="input-card">
        <span>Cabin</span>
        <select
          aria-label="Cabin"
          value={search.cabin}
          onChange={(event) => patchSearch({ cabin: event.target.value as FlightOption['cabin'] })}
        >
          {cabins.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="input-card">
        <span>Search for</span>
        <select
          aria-label="Search for"
          value={search.mode}
          onChange={(event) => patchSearch({ mode: event.target.value as SearchQuery['mode'] })}
        >
          {modes.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
