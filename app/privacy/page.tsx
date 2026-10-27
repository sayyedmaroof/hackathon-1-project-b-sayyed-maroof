import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy' }

export default function PrivacyPage() {
  return (
    <article className="prose max-w-2xl">
      <h1 className="text-3xl font-semibold">Privacy</h1>
      <p className="mt-4 text-sm leading-7 text-ink-muted">
        FareFlip is a spend-planning guide, not financial advice. Guest data (cards, balances, spend and custom trip
        drafts) stays in this browser’s localStorage. An account stores email, name, password hash, cards, balances,
        spend profile and saved plan inputs on the server. Duffel is used only to fetch cash fares. We do not sell your
        data. Contact hello@fareflip.app to ask for deletion of an account.
      </p>
    </article>
  )
}
