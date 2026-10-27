import { formatRange } from '../dates.ts'
import type { Alert, Cabin, LoyaltyProgram, SearchQuery, Trip } from '../types.ts'

/** Illustrative defaults — sample data only. */

export const defaultSearch: SearchQuery = {
  origin: 'Madrid (MAD)',
  destination: 'New York (JFK)',
  depart: '2027-05-12',
  returnDate: '2027-05-19',
  when: formatRange('2027-05-12', '2027-05-19'),
  travelers: '1 adult',
  cabin: 'Business',
  mode: 'Compare both',
  flexible: true,
}

export const sampleTrip: Trip = {
  id: 'ba-hnd-business',
  title: 'Madrid → Tokyo',
  detail: '12 May 2027 — 19 May 2027 · 1 adult · Business',
  cash: 3000,
  fees: 860,
  points: 90000,
  program: 'Avios',
  cabin: 'Business',
  airline: 'British Airways',
  bookUrl: 'https://example.com/book?flight=ba-hnd-business',
  checklist: [],
}

export const defaultPrograms: LoyaltyProgram[] = [
  {
    id: 'iberia',
    name: 'Iberia Avios',
    balance: 120000,
    unit: 'Avios',
    note: 'Pooled with British Airways',
  },
]

export const defaultAlerts: Alert[] = [
  {
    id: 'mad-jfk-business',
    route: 'Madrid → New York',
    detail: 'Business · Target under €1,000',
    active: true,
    cabin: 'Business',
    targetPrice: 1000,
  },
]

export const searchExamples: Array<{ label: string; patch: Partial<SearchQuery> }> = [
  {
    label: 'Find business class to Tokyo',
    patch: {
      origin: 'Madrid (MAD)',
      destination: 'Tokyo (HND)',
      depart: '2027-10-12',
      returnDate: '2027-10-19',
      cabin: 'Business',
      mode: 'Compare both',
      travelers: '1 adult',
      flexible: true,
    },
  },
  {
    label: 'A weekend in Lisbon',
    patch: {
      origin: 'Madrid (MAD)',
      destination: 'Lisbon (LIS)',
      depart: '2027-04-16',
      returnDate: '2027-04-18',
      cabin: 'Economy',
      mode: 'Compare both',
      travelers: '1 adult',
      flexible: true,
    },
  },
  {
    label: 'Use my Avios to get to New York',
    patch: {
      origin: 'Madrid (MAD)',
      destination: 'New York (JFK)',
      depart: '2027-05-12',
      returnDate: '2027-05-19',
      cabin: 'Business',
      mode: 'Points options',
      travelers: '1 adult',
      flexible: true,
    },
  },
]

export const johannesburgSearch: Partial<SearchQuery> = {
  origin: 'Madrid (MAD)',
  destination: 'Johannesburg (JNB)',
  cabin: 'Economy',
  mode: 'Compare both',
}

export const travelers = ['1 adult', '2 adults', '2 adults, 1 child']
export const cabins: Cabin[] = ['Economy', 'Premium Economy', 'Business', 'First']
export const modes: SearchQuery['mode'][] = ['Compare both', 'Cash fares', 'Points options']
