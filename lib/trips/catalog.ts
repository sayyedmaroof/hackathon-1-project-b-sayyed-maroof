import type { PointCurrencyId } from '@/lib/cards/types'
import type { Cabin } from '@/lib/types'

export type TripJourney = 'one_way' | 'return'

export type SampleTrip = {
  id: string
  label: string
  origin: string
  destination: string
  originIata: string
  destinationIata: string
  cabin: Cabin
  journey: TripJourney
  /** Used only when journey is return. Default 7. */
  tripLengthDays?: number
  awardCurrency: Extract<PointCurrencyId, 'iberia_avios' | 'ba_avios' | 'qatar_avios'>
  /** Points for the stated journey (see label). SAMPLE award chart. */
  pointsRequired: number
  taxesEur: number
  /** SAMPLE cash fare for the same journey and cabin. Fallback Duffel baseline. */
  typicalCashEur: number
  note: string
  image?: string
}

const SAMPLE = 'Sample values — not live availability or a real award chart.'

/**
 * Hardcoded Madrid sample trips. Cash and points numbers are illustrative,
 * copied from the old sample-routes demo fares and labelled as samples.
 */
export const TRIP_CATALOG: SampleTrip[] = [
  {
    id: 'mad-jfk-business-return',
    label: 'Madrid to New York business return · 100,000 Avios',
    origin: 'Madrid',
    destination: 'New York',
    originIata: 'MAD',
    destinationIata: 'JFK',
    cabin: 'Business',
    journey: 'return',
    tripLengthDays: 7,
    awardCurrency: 'iberia_avios',
    pointsRequired: 100000,
    taxesEur: 350,
    typicalCashEur: 2500,
    note: SAMPLE,
    image: '/images/window.jpg',
  },
  {
    id: 'mad-jfk-economy-one-way',
    label: 'Madrid to New York economy one-way · 15,000 Avios',
    origin: 'Madrid',
    destination: 'New York',
    originIata: 'MAD',
    destinationIata: 'JFK',
    cabin: 'Economy',
    journey: 'one_way',
    awardCurrency: 'iberia_avios',
    pointsRequired: 15000,
    taxesEur: 80,
    typicalCashEur: 410,
    note: SAMPLE,
    image: '/images/window.jpg',
  },
  {
    id: 'mad-lis-economy-return',
    label: 'Madrid to Lisbon economy return · 7,500 Avios',
    origin: 'Madrid',
    destination: 'Lisbon',
    originIata: 'MAD',
    destinationIata: 'LIS',
    cabin: 'Economy',
    journey: 'return',
    tripLengthDays: 7,
    awardCurrency: 'iberia_avios',
    pointsRequired: 7500,
    taxesEur: 40,
    typicalCashEur: 180,
    note: SAMPLE,
    image: '/images/lisbon.jpg',
  },
  {
    id: 'mad-lis-business-one-way',
    label: 'Madrid to Lisbon business one-way · 15,000 Avios',
    origin: 'Madrid',
    destination: 'Lisbon',
    originIata: 'MAD',
    destinationIata: 'LIS',
    cabin: 'Business',
    journey: 'one_way',
    awardCurrency: 'iberia_avios',
    pointsRequired: 15000,
    taxesEur: 60,
    typicalCashEur: 420,
    note: SAMPLE,
    image: '/images/lisbon.jpg',
  },
  {
    id: 'mad-cpt-economy-return',
    label: 'Madrid to Cape Town economy return · 80,000 Avios',
    origin: 'Madrid',
    destination: 'Cape Town',
    originIata: 'MAD',
    destinationIata: 'CPT',
    cabin: 'Economy',
    journey: 'return',
    tripLengthDays: 7,
    awardCurrency: 'ba_avios',
    pointsRequired: 80000,
    taxesEur: 310,
    typicalCashEur: 980,
    note: SAMPLE,
    image: '/images/cape-town.jpg',
  },
  {
    id: 'mad-cpt-business-return',
    label: 'Madrid to Cape Town business return · 90,000 Avios',
    origin: 'Madrid',
    destination: 'Cape Town',
    originIata: 'MAD',
    destinationIata: 'CPT',
    cabin: 'Business',
    journey: 'return',
    tripLengthDays: 7,
    awardCurrency: 'ba_avios',
    pointsRequired: 90000,
    taxesEur: 480,
    typicalCashEur: 2400,
    note: SAMPLE,
    image: '/images/cape-town.jpg',
  },
  {
    id: 'mad-nrt-business-return',
    label: 'Madrid to Tokyo business return · 95,000 Avios',
    origin: 'Madrid',
    destination: 'Tokyo',
    originIata: 'MAD',
    destinationIata: 'NRT',
    cabin: 'Business',
    journey: 'return',
    tripLengthDays: 7,
    awardCurrency: 'ba_avios',
    pointsRequired: 95000,
    taxesEur: 620,
    typicalCashEur: 3200,
    note: SAMPLE,
    image: '/images/tokyo.jpg',
  },
  {
    id: 'mad-jnb-business-return',
    label: 'Madrid to Johannesburg business return · 75,000 Avios',
    origin: 'Madrid',
    destination: 'Johannesburg',
    originIata: 'MAD',
    destinationIata: 'JNB',
    cabin: 'Business',
    journey: 'return',
    tripLengthDays: 7,
    awardCurrency: 'ba_avios',
    pointsRequired: 75000,
    taxesEur: 390,
    typicalCashEur: 2100,
    note: SAMPLE,
    image: '/images/window.jpg',
  },
]

export function getTrip(id: string): SampleTrip | undefined {
  return TRIP_CATALOG.find((t) => t.id === id)
}

export function tripIds(): string[] {
  return TRIP_CATALOG.map((t) => t.id)
}

export const CUSTOM_TRIP_ID = 'custom'

export type CustomTripDraft = {
  origin: string
  originIata: string
  destination: string
  destinationIata: string
  cabin: Extract<Cabin, 'Economy' | 'Business'>
  journey: TripJourney
  awardCurrency: SampleTrip['awardCurrency']
  pointsRequired: number
  taxesEur: number
  typicalCashEur: number
}

export const DEFAULT_CUSTOM_TRIP: CustomTripDraft = {
  origin: 'Madrid',
  originIata: 'MAD',
  destination: '',
  destinationIata: '',
  cabin: 'Economy',
  journey: 'return',
  awardCurrency: 'iberia_avios',
  pointsRequired: 20000,
  taxesEur: 80,
  typicalCashEur: 400,
}

function iataCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
}

export function normalizeCustomTrip(draft: CustomTripDraft): CustomTripDraft {
  return {
    ...draft,
    origin: draft.origin.trim(),
    destination: draft.destination.trim(),
    originIata: iataCode(draft.originIata),
    destinationIata: iataCode(draft.destinationIata),
    pointsRequired: Math.max(1, Math.round(Number(draft.pointsRequired) || 0)),
    taxesEur: Math.max(0, Number(draft.taxesEur) || 0),
    typicalCashEur: Math.max(1, Number(draft.typicalCashEur) || 1),
  }
}

export function isCustomTripComplete(draft: CustomTripDraft): boolean {
  const n = normalizeCustomTrip(draft)
  return n.originIata.length === 3 && n.destinationIata.length === 3 && n.originIata !== n.destinationIata
}

export function buildCustomTrip(draft: CustomTripDraft): SampleTrip {
  const n = normalizeCustomTrip(draft)
  const origin = n.origin || n.originIata || 'Origin'
  const destination = n.destination || n.destinationIata || 'Custom destination'
  const journeyLabel = n.journey === 'return' ? 'return' : 'one-way'
  return {
    id: CUSTOM_TRIP_ID,
    label: `${origin} to ${destination} ${n.cabin.toLowerCase()} ${journeyLabel} · ${n.pointsRequired.toLocaleString('en-GB')} Avios`,
    origin,
    destination,
    originIata: n.originIata || 'MAD',
    destinationIata: n.destinationIata || 'XXX',
    cabin: n.cabin,
    journey: n.journey,
    tripLengthDays: n.journey === 'return' ? 7 : undefined,
    awardCurrency: n.awardCurrency,
    pointsRequired: n.pointsRequired,
    taxesEur: n.taxesEur,
    typicalCashEur: n.typicalCashEur,
    note: 'Custom trip — values you entered, not live availability or a real award chart.',
  }
}
