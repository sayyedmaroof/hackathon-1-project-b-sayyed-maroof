import { airports, filterAirports } from '@/lib/airports'

export type PlaceHit = {
  iata: string
  city: string
  name: string
  country: string
  kind: 'airport' | 'city'
}

export type DuffelPlaceSuggestion = {
  id?: string
  type?: string
  name?: string
  iata_code?: string | null
  iata_country_code?: string | null
  city_name?: string | null
}

export function searchLocalPlaces(query: string, limit = 8): PlaceHit[] {
  return filterAirports(query)
    .slice(0, limit)
    .map((airport) => ({
      iata: airport.code,
      city: airport.city,
      name: airport.name,
      country: airport.country,
      kind: 'airport' as const,
    }))
}

export function mapPlaceSuggestions(rows: DuffelPlaceSuggestion[], limit = 8): PlaceHit[] {
  const seen = new Set<string>()
  const hits: PlaceHit[] = []
  for (const row of rows) {
    const iata = (row.iata_code ?? '').toUpperCase()
    if (row.type === 'city') continue
    if (!/^[A-Z]{3}$/.test(iata) || seen.has(iata)) continue
    seen.add(iata)
    hits.push({
      iata,
      city: (row.city_name || row.name || iata).trim(),
      name: (row.name || iata).trim(),
      country: (row.iata_country_code || '').toUpperCase(),
      kind: row.type === 'city' ? 'city' : 'airport',
    })
    if (hits.length >= limit) break
  }
  return hits
}

export function defaultPlaces(): PlaceHit[] {
  return airports.slice(0, 8).map((airport) => ({
    iata: airport.code,
    city: airport.city,
    name: airport.name,
    country: airport.country,
    kind: 'airport',
  }))
}
