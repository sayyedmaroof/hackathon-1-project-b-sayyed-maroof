import type { Airport } from './types.ts'

export const airports: Airport[] = [
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas', country: 'Spain' },
  { code: 'BCN', city: 'Barcelona', name: 'Josep Tarradellas Barcelona–El Prat', country: 'Spain' },
  { code: 'LIS', city: 'Lisbon', name: 'Humberto Delgado', country: 'Portugal' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy', country: 'United States' },
  { code: 'LHR', city: 'London', name: 'Heathrow', country: 'United Kingdom' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'France' },
  { code: 'JNB', city: 'Johannesburg', name: 'O. R. Tambo', country: 'South Africa' },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International', country: 'South Africa' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita', country: 'Japan' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda', country: 'Japan' },
  { code: 'DOH', city: 'Doha', name: 'Hamad International', country: 'Qatar' },
]

export function airportLabel(airport: Airport): string {
  return `${airport.city} (${airport.code})`
}

export function filterAirports(query: string): Airport[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return airports
  return airports.filter((airport) => {
    const label = airportLabel(airport).toLowerCase()
    return (
      airport.city.toLowerCase().includes(needle) ||
      airport.name.toLowerCase().includes(needle) ||
      airport.code.toLowerCase().includes(needle) ||
      airport.country.toLowerCase().includes(needle) ||
      label.includes(needle)
    )
  })
}

export function matchAirport(input: string): Airport | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const parenthetical = trimmed.match(/\(([A-Za-z]{3})\)\s*$/)
  const code = parenthetical?.[1] ?? (/^[A-Za-z]{3}$/.test(trimmed) ? trimmed : null)
  if (code) {
    const byCode = airports.find((airport) => airport.code === code.toUpperCase())
    if (byCode) return byCode
  }

  const lower = trimmed.toLowerCase()
  return (
    airports.find((airport) => {
      return (
        airport.city.toLowerCase() === lower ||
        airport.name.toLowerCase() === lower ||
        airportLabel(airport).toLowerCase() === lower
      )
    }) ?? null
  )
}
