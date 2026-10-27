import type { FlightOffer, ProviderSearchQuery } from './types'

type DuffelSegment = {
  departing_at: string
  arriving_at: string
  operating_carrier?: { iata_code?: string; name?: string }
  marketing_carrier?: { iata_code?: string; name?: string }
}

type DuffelSlice = {
  origin?: { iata_code?: string }
  destination?: { iata_code?: string }
  segments?: DuffelSegment[]
  duration?: string
}

type DuffelOffer = {
  id: string
  total_amount: string
  total_currency: string
  slices?: DuffelSlice[]
  owner?: { iata_code?: string; name?: string }
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

function formatTime(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(11, 16)
  } catch {
    return iso
  }
}

function stopsLabel(segments: DuffelSegment[] | undefined): string {
  const count = segments?.length ?? 1
  if (count <= 1) return 'Nonstop'
  return `${count - 1} stop${count - 1 > 1 ? 's' : ''}`
}

function toEur(amount: string, currency: string): number {
  const n = Number.parseFloat(amount)
  if (!Number.isFinite(n)) return 0
  if (currency === 'EUR') return n
  if (currency === 'GBP') return n * 1.17
  if (currency === 'USD') return n * 0.92
  return n
}

export function mapDuffelOffers(
  offers: DuffelOffer[],
  query: ProviderSearchQuery,
  meta: { kind: FlightOffer['kind']; why: string; searchOrigin?: string; searchDestination?: string },
): FlightOffer[] {
  return offers.map((offer) => {
    const slice = offer.slices?.[0]
    const segments = slice?.segments ?? []
    const first = segments[0]
    const last = segments[segments.length - 1] ?? first
    const code = offer.owner?.iata_code ?? first?.marketing_carrier?.iata_code ?? 'XX'
    const airline = offer.owner?.name ?? first?.operating_carrier?.name ?? code
    const cash = toEur(offer.total_amount, offer.total_currency)

    return {
      id: `duffel-${offer.id}`,
      kind: meta.kind,
      source: 'duffel',
      airline,
      airlineCode: code,
      origin: slice?.origin?.iata_code ?? query.origin,
      destination: slice?.destination?.iata_code ?? query.destination,
      departTime: first ? formatTime(first.departing_at) : '—',
      arriveTime: last ? formatTime(last.arriving_at) : '—',
      duration: parseDuration(slice?.duration),
      stops: stopsLabel(segments),
      cabin: query.cabin,
      cashPrice: Math.round(cash),
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
    }
  })
}
