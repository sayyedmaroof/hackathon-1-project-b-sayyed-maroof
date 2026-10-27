import type { Airport } from './types.ts'

export const airports: Airport[] = [
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas', country: 'Spain' },
  { code: 'BCN', city: 'Barcelona', name: 'Josep Tarradellas Barcelona–El Prat', country: 'Spain' },
  { code: 'AGP', city: 'Malaga', name: 'Málaga-Costa del Sol', country: 'Spain' },
  { code: 'VLC', city: 'Valencia', name: 'Valencia', country: 'Spain' },
  { code: 'SVQ', city: 'Seville', name: 'Seville', country: 'Spain' },
  { code: 'BIO', city: 'Bilbao', name: 'Bilbao', country: 'Spain' },
  { code: 'PMI', city: 'Palma', name: 'Palma de Mallorca', country: 'Spain' },
  { code: 'LIS', city: 'Lisbon', name: 'Humberto Delgado', country: 'Portugal' },
  { code: 'OPO', city: 'Porto', name: 'Francisco Sá Carneiro', country: 'Portugal' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy', country: 'United States' },
  { code: 'EWR', city: 'New York', name: 'Newark Liberty', country: 'United States' },
  { code: 'LHR', city: 'London', name: 'Heathrow', country: 'United Kingdom' },
  { code: 'LGW', city: 'London', name: 'Gatwick', country: 'United Kingdom' },
  { code: 'STN', city: 'London', name: 'Stansted', country: 'United Kingdom' },
  { code: 'LCY', city: 'London', name: 'London City', country: 'United Kingdom' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'France' },
  { code: 'ORY', city: 'Paris', name: 'Orly', country: 'France' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol', country: 'Netherlands' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt', country: 'Germany' },
  { code: 'MUC', city: 'Munich', name: 'Munich', country: 'Germany' },
  { code: 'FCO', city: 'Rome', name: 'Fiumicino', country: 'Italy' },
  { code: 'MXP', city: 'Milan', name: 'Malpensa', country: 'Italy' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich', country: 'Switzerland' },
  { code: 'DUB', city: 'Dublin', name: 'Dublin', country: 'Ireland' },
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
