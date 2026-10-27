import type { FlightOption, SearchQuery, Trip } from '../types.ts'

export function placeName(label: string) {
  return label.replace(/\s*\([A-Za-z]{3}\)\s*$/, '').trim() || label
}

export function flightToTrip(flight: FlightOption, search: SearchQuery): Trip {
  return {
    id: flight.id,
    title: `${placeName(search.origin)} → ${placeName(search.destination)}`,
    detail: `${search.when} · ${search.travelers} · ${flight.cabin}`,
    cash: flight.cash,
    fees: flight.fees,
    points: flight.points,
    program: 'Avios',
    cabin: flight.cabin,
    airline: flight.airline,
    bookUrl: `https://example.com/book?flight=${encodeURIComponent(flight.id)}`,
    checklist: [],
  }
}

export function travelerLabel(value: string) {
  return value === '1 adult' ? '1 traveler' : value
}

export function cabinLabel(value: string) {
  if (value === 'Business') return 'Business Class'
  if (value === 'First') return 'First Class'
  return value
}
