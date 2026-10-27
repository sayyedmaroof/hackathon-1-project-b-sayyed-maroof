import Link from 'next/link'
import { ILLUSTRATIVE_RATES_LABEL } from '@/lib/cards/constants'
import { POINT_CURRENCIES } from '@/lib/cards/currencies'
import type { PointsPlan } from '@/lib/cards/types'
import { formatEuro, formatPoints } from '@/lib/savings'

export function PointsPathPanel({
  plan,
  currencyId,
  isSampleProfile,
  userVerified,
  resultsPath,
}: {
  plan: PointsPlan
  currencyId?: string
  isSampleProfile: boolean
  userVerified: boolean
  resultsPath: string
}) {
  const unit =
    currencyId && currencyId in POINT_CURRENCIES
      ? POINT_CURRENCIES[currencyId as keyof typeof POINT_CURRENCIES].displayName
      : 'points'

  const rec = plan.recommended
  const walletHref = userVerified ? '/wallet' : `/login?next=${encodeURIComponent('/wallet')}`

  return (
    <section className="mt-6 border-t border-[#e8ddd1] pt-5">
      <h3 className="font-semibold">Your points path</h3>
      {!userVerified ? (
        <p className="mt-2 text-sm text-[#66584e]">
          <Link href={walletHref} className="font-semibold text-[#b86632]">
            Add your cards to see your path
          </Link>
          . Showing an illustrative sample profile below.
        </p>
      ) : null}
      {isSampleProfile ? (
        <p className="mt-2 text-xs text-[#8a796b]">Sample profile — not your saved wallet.</p>
      ) : null}
      <p className="mt-3 text-sm text-[#66584e]">
        You have <strong>{formatPoints(plan.reachable)}</strong>, need <strong>{formatPoints(plan.reachable + plan.shortfall)}</strong>
        {plan.shortfall > 0 ? (
          <>
            , short <strong>{formatPoints(plan.shortfall)}</strong>
          </>
        ) : null}{' '}
        {unit}.
      </p>
      <div className="mt-4 rounded-2xl border border-[#b86632] bg-[#fff5eb] p-4">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-[#b86632]">Recommended</p>
        <p className="mt-2 text-sm font-semibold text-[#2a211b]">{recommendedSummary(rec)}</p>
        <p className="mt-1 text-sm text-[#66584e]">
          Net saving {formatEuro(rec.netSavingEur)}
          {rec.months > 0 ? ` · ~${rec.months} mo` : ''}
        </p>
      </div>
      {plan.options.length > 1 ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#b86632]">Other options</summary>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-[#66584e]">
            {plan.options
              .filter((o) => o !== rec)
              .map((o) => (
                <li key={`${o.kind}-${o.description}`} className="rounded-xl border border-[#e8ddd1] px-3 py-2">
                  {o.description} — {formatEuro(o.netSavingEur)} net · {o.months ? `${o.months} mo` : 'now'}
                </li>
              ))}
          </ul>
        </details>
      ) : null}
      {plan.transferNotes.length > 0 ? (
        <ul className="mt-4 list-disc pl-5 text-xs text-[#76675c]">
          {plan.transferNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
      {plan.illustrativeDataUsed ? (
        <p className="mock-label mt-4 inline-block">{ILLUSTRATIVE_RATES_LABEL}</p>
      ) : null}
    </section>
  )
}

function recommendedSummary(option: PointsPlan['recommended']): string {
  if (option.kind === 'book_now') return 'Book now with your current balances'
  if (option.kind === 'pay_cash') return 'Pay cash — points are not the best value here'
  if (option.months > 0) return `${option.description} (about ${option.months} months)`
  return option.description
}
