import type { SearchQuery } from '@/lib/types'
import { matchAirport } from '@/lib/airports'

export function searchQueryToResultsUrl(search: SearchQuery): string {
  const origin = matchAirport(search.origin)?.code ?? search.origin
  const destination = matchAirport(search.destination)?.code ?? search.destination
  const adultsMatch = search.travelers.match(/(\d+)/)
  const adults = adultsMatch ? adultsMatch[1] : '1'
  const params = new URLSearchParams({
    origin,
    destination,
    depart: search.depart,
    return: search.returnDate,
    cabin: search.cabin,
    flexible: search.flexible ? '1' : '0',
    adults,
  })
  return `/results?${params.toString()}`
}

export function resultsUrlFromCodes(input: {
  origin: string
  destination: string
  depart: string
  returnDate: string
  cabin: string
  flexible: boolean
  adults: number
}): string {
  const params = new URLSearchParams({
    origin: input.origin,
    destination: input.destination,
    depart: input.depart,
    return: input.returnDate,
    cabin: input.cabin,
    flexible: input.flexible ? '1' : '0',
    adults: String(input.adults),
  })
  return `/results?${params.toString()}`
}
