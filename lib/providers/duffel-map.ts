import type { DataMode, FlightOffer, OfferSegment, OfferSlice, ProviderSearchQuery } from './types'

export type DuffelSegment = {
  departing_at?: string
  arriving_at?: string
  duration?: string
  origin?: { iata_code?: string }
  destination?: { iata_code?: string }
  operating_carrier?: { iata_code?: string; name?: string }
  marketing_carrier?: { iata_code?: string; name?: string }
  marketing_carrier_flight_number?: string
  aircraft?: { name?: string; iata_code?: string }
  passengers?: { baggages?: { type?: string; quantity?: number }[] }[]
}

export type DuffelSlice = {
  origin?: { iata_code?: string }
  destination?: { iata_code?: string }
  segments?: DuffelSegment[]
  duration?: string
}

export type DuffelOffer = {
  id?: string
  expires_at?: string
  total_amount?: string
  total_currency?: string
  base_amount?: string | null
  tax_amount?: string | null
  slices?: DuffelSlice[]
  owner?: { iata_code?: string; name?: string }
  passengers?: { id?: string }[]
  conditions?: {
    change_before_departure?: { allowed?: boolean } | null
    refund_before_departure?: { allowed?: boolean } | null
  }
}

const TONE: Record<string, string> = {
  IB: 'bg-[#cf3d2e]',
  BA: 'bg-[#132d4a]',
  AF: 'bg-[#243b6b]',
  VY: 'bg-[#f2c200] text-[#2a211b]',
  QR: 'bg-[#5c0632]',
}

function parseDuration(iso?: string): string {
  if (!iso) return '—'
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return iso
  const h = match[1] ? `${match[1]}h` : ''
  const m = match[2] ? ` ${match[2]}m` : ''
  return `${h}${m}`.trim() || iso
}

function formatTime(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toISOString().slice(11, 16)
  } catch {
    return iso
  }
}

function parseAmount(value?: string | null): number | undefined {
  if (value == null || value === '') return undefined
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : undefined
}

function stopsLabel(segments: DuffelSegment[] | undefined): string {
  const count = segments?.length ?? 1
  if (count <= 1) return 'Nonstop'
  return `${count - 1} stop${count - 1 > 1 ? 's' : ''}`
}

function mapSegment(segment: DuffelSegment): OfferSegment {
  const marketing = segment.marketing_carrier?.iata_code
  const number = segment.marketing_carrier_flight_number
  return {
    origin: segment.origin?.iata_code,
    destination: segment.destination?.iata_code,
    departingAt: segment.departing_at,
    arrivingAt: segment.arriving_at,
    duration: parseDuration(segment.duration),
    marketingCarrier: marketing,
    flightNumber: marketing && number ? `${marketing}${number}` : number,
    aircraft: segment.aircraft?.name ?? segment.aircraft?.iata_code,
  }
}

function mapSlices(slices: DuffelSlice[] | undefined): OfferSlice[] {
  return (slices ?? []).map((slice) => ({
    origin: slice.origin?.iata_code,
    destination: slice.destination?.iata_code,
    duration: parseDuration(slice.duration),
    segments: (slice.segments ?? []).map(mapSegment),
  }))
}

function baggageLabel(slices: DuffelSlice[] | undefined): string | undefined {
  for (const slice of slices ?? []) {
    for (const segment of slice.segments ?? []) {
      const bags = segment.passengers?.[0]?.baggages ?? []
      const checked = bags.find((b) => b.type === 'checked')
      if (checked?.quantity != null) return `${checked.quantity} checked bag${checked.quantity === 1 ? '' : 's'}`
    }
  }
  return undefined
}

export function mapDuffelOffer(
  offer: DuffelOffer,
  query: ProviderSearchQuery,
  meta: { kind: FlightOffer['kind']; why: string; searchOrigin?: string; searchDestination?: string; dataMode: DataMode },
): FlightOffer | null {
  if (!offer.id || offer.total_amount == null) return null
  const outbound = offer.slices?.[0]
  const segments = outbound?.segments ?? []
  const first = segments[0]
  const last = segments[segments.length - 1] ?? first
  const code = offer.owner?.iata_code ?? first?.marketing_carrier?.iata_code ?? 'XX'
  const airline = offer.owner?.name ?? first?.operating_carrier?.name ?? code
  const cash = parseAmount(offer.total_amount) ?? 0
  const currency = offer.total_currency ?? 'EUR'

  return {
    id: `duffel-${offer.id}`,
    kind: meta.kind,
    source: 'duffel',
    airline,
    airlineCode: code,
    origin: outbound?.origin?.iata_code ?? query.origin,
    destination: outbound?.destination?.iata_code ?? query.destination,
    departTime: formatTime(first?.departing_at),
    arriveTime: formatTime(last?.arriving_at),
    duration: parseDuration(outbound?.duration),
    stops: stopsLabel(segments),
    cabin: query.cabin,
    cashPrice: cash,
    points: 0,
    fees: 0,
    tone: TONE[code] ?? 'bg-[#2a211b]',
    whyThisWorks: meta.why,
    isSampleAward: false,
    duffelOfferId: offer.id,
    searchOrigin: meta.searchOrigin ?? query.origin,
    searchDestination: meta.searchDestination ?? query.destination,
    departDate: query.departDate,
    returnDate: query.returnDate,
    expiresAt: offer.expires_at,
    currency,
    dataMode: meta.dataMode,
    totalAmountRaw: offer.total_amount,
    baseAmount: parseAmount(offer.base_amount),
    taxAmount: parseAmount(offer.tax_amount),
    passengerIds: (offer.passengers ?? []).map((p) => p.id).filter((id): id is string => Boolean(id)),
    slices: mapSlices(offer.slices),
    changeable: offer.conditions?.change_before_departure?.allowed,
    refundable: offer.conditions?.refund_before_departure?.allowed,
    baggage: baggageLabel(offer.slices),
  }
}

export function mapDuffelOffers(
  offers: DuffelOffer[],
  query: ProviderSearchQuery,
  meta: { kind: FlightOffer['kind']; why: string; searchOrigin?: string; searchDestination?: string; dataMode: DataMode },
): FlightOffer[] {
  return offers.map((offer) => mapDuffelOffer(offer, query, meta)).filter((o): o is FlightOffer => o != null)
}
