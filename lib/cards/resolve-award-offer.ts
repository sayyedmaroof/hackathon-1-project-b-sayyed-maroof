import { sampleAwardProvider } from '@/lib/providers/award-sample'
import type { Cabin } from '@/lib/types'
import type { FlightOffer } from '@/lib/providers/types'

export async function resolveSampleAwardOffer(input: {
  offerKey: string
  origin: string
  destination: string
  departDate: string
  returnDate: string
  cabin: string
  adults?: number
}): Promise<FlightOffer | null> {
  const offers = await sampleAwardProvider.search({
    origin: input.origin,
    destination: input.destination,
    departDate: input.departDate,
    returnDate: input.returnDate,
    cabin: input.cabin as Cabin,
    adults: input.adults ?? 1,
  })
  return offers.find((o) => o.id === input.offerKey) ?? null
}
