export type OfferSnapshot = {
  offerId: string
  amount: string
  currency: string
  expiresAt?: string
  baselineAmount: number
  baselineCurrency: string
}

const SNAPSHOTS = new Map<string, OfferSnapshot>()

export function rememberOfferSnapshot(snapshot: OfferSnapshot): void {
  SNAPSHOTS.set(snapshot.offerId, snapshot)
}

export function getOfferSnapshot(offerId: string): OfferSnapshot | undefined {
  return SNAPSHOTS.get(offerId)
}

export function clearOfferSnapshots(): void {
  SNAPSHOTS.clear()
}
