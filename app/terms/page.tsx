import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms' }

export default function TermsPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="text-3xl font-semibold">Terms</h1>
      <p className="mt-4 text-sm leading-7 text-ink-muted">
        FareFlip is not financial advice. Earn rates, caps, fees and redemption values are illustrative unless marked
        verified — verify them with the issuer. Sample trip points and cash figures are examples. Live cash fares from
        Duffel, when shown, are published cash offers and do not mean seats or awards are available. FareFlip does not
        book flights. You use the plans at your own risk.
      </p>
    </article>
  )
}
