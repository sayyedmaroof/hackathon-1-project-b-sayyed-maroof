import 'server-only'

import type { FlightOffer, ProviderSearchQuery } from './types'

function hash(input: string): number {
  let n = 0
  for (let i = 0; i < input.length; i++) n = (n * 31 + input.charCodeAt(i)) >>> 0
  return n
}

export function searchSampleCash(query: ProviderSearchQuery): FlightOffer[] {
  const seed = hash(`${query.origin}${query.destination}${query.departDate}${query.cabin}${query.adults}`)
  const price = 180 + (seed % 420)
  return [
    {
      id: `sample-cash-${query.origin}-${query.destination}-${query.departDate}`,
      kind: 'cash',
      source: 'sample_cash',
      airline: 'Sample Air',
      airlineCode: 'SA',
      origin: query.origin,
      destination: query.destination,
      departTime: '09:10',
      arriveTime: '12:40',
      duration: '3h 30m',
      stops: 'Nonstop',
      cabin: query.cabin,
      cashPrice: price,
      points: 0,
      fees: 0,
      tone: 'bg-[#2a211b]',
      whyThisWorks: 'Deterministic sample cash fare used when no Duffel key is set in development.',
      isSampleAward: false,
      dataMode: 'sample',
      currency: 'EUR',
      totalAmountRaw: String(price),
      departDate: query.departDate,
      returnDate: query.returnDate,
      passengerIds: ['pas_sample_1'],
    },
  ]
}
