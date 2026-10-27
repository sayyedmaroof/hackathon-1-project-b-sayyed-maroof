export type OfferPrice = {
  amount: string
  currency: string
}

export function pricesEqual(a: OfferPrice, b: OfferPrice): boolean {
  if (a.currency !== b.currency) return false
  return Number.parseFloat(a.amount) === Number.parseFloat(b.amount)
}

export function priceChangedMessage(fresh: OfferPrice): string {
  return `The price changed to ${fresh.amount} ${fresh.currency}, confirm to continue`
}

export function offerExpired(expiresAt?: string, now = Date.now()): boolean {
  if (!expiresAt) return false
  const at = Date.parse(expiresAt)
  return Number.isFinite(at) && at <= now
}

export function computeSaving(baselineAmount: number, paidAmount: number, sameCurrency: boolean): number {
  if (!sameCurrency) return 0
  return Math.max(0, Math.round(baselineAmount - paidAmount))
}
