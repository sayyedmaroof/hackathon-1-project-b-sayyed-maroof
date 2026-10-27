import { sampleFlights } from '@/lib/data/sample-routes'
import type { AwardProvider, FlightOffer, ProviderSearchQuery } from './types'

const TONE: Record<string, string> = {
  IB: 'bg-[#cf3d2e]',
  BA: 'bg-[#132d4a]',
  AF: 'bg-[#243b6b]',
  VY: 'bg-[#f2c200] text-[#2a211b]',
}

function toOffer(row: (typeof sampleFlights)[0], query: ProviderSearchQuery): FlightOffer {
  return {
    id: `award-${row.id}`,
    kind: 'award',
    source: 'award_sample',
    airline: row.airline,
    airlineCode: row.code,
    origin: row.from,
    destination: row.to,
    departTime: row.departTime,
    arriveTime: row.arriveTime,
    duration: row.duration,
    stops: row.stops,
    cabin: row.cabin,
    cashPrice: row.cash,
    points: row.points,
    fees: row.fees,
    tone: row.tone || TONE[row.code] || 'bg-[#2a211b]',
    whyThisWorks: 'Award seats plus taxes can beat the cash fare when points are valued fairly.',
    isSampleAward: true,
    departDate: query.departDate,
    returnDate: query.returnDate,
  }
}

export const sampleAwardProvider: AwardProvider = {
  async search(query: ProviderSearchQuery): Promise<FlightOffer[]> {
    return sampleFlights
      .filter((f) => f.from === query.origin && f.to === query.destination && f.cabin === query.cabin)
      .map((f) => toOffer(f, query))
  },
}
