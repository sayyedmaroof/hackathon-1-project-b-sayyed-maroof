'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { askPlan, explainPlan } from '@/app/actions/plan-narration'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/components/i18n-provider'
import { buildPlanFacts } from '@/lib/llm/plan-facts'
import { formatPoints } from '@/lib/plan/display'
import { formatPlanDate } from '@/lib/plan/dates'
import { cashVersusHacked, feesFromNetSaving } from '@/lib/plan/value'
import type { SpendPlan } from '@/lib/plan/types'
import type { SampleTrip } from '@/lib/trips/catalog'
import { formatEuro } from '@/lib/savings'

const DEBOUNCE_MS = 600
const UNAVAILABLE = 'Plain-language summary is unavailable.'
const RATE_LIMITED = 'Too many questions, try again in a few minutes.'

type ChatTurn = { role: 'user' | 'assistant'; text: string }

function planFingerprint(plan: SpendPlan, travelDate: string): string {
  return JSON.stringify({
    tripId: plan.tripId,
    travelDate,
    status: plan.status,
    netSavingEur: plan.netSavingEur,
    assignments: plan.assignments.map((row) => [
      row.category,
      row.eur,
      row.cardName,
      row.pointsInTripCurrency,
    ]),
    suggestionKinds: plan.suggestions.map((row) => row.kind),
  })
}

export function PlanNarration({
  plan,
  trip,
  travelDate,
}: {
  plan: SpendPlan
  trip: SampleTrip
  travelDate: string
}) {
  const { locale } = useI18n()
  const fingerprint = useMemo(() => planFingerprint(plan, travelDate), [plan, travelDate])
  const facts = useMemo(
    () =>
      buildPlanFacts({
        plan,
        tripLabel: trip.label,
        origin: trip.origin,
        destination: trip.destination,
        cabin: trip.cabin,
        travelDate,
      }),
    [plan, trip, travelDate],
  )

  const [summary, setSummary] = useState<string | null>(null)
  const [summaryState, setSummaryState] = useState<'loading' | 'ready' | 'unavailable' | 'rate_limited'>('loading')
  const [thread, setThread] = useState<ChatTurn[]>([])
  const [draft, setDraft] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatNotice, setChatNotice] = useState<string | null>(null)
  const requestId = useRef(0)
  const factsRef = useRef(facts)
  factsRef.current = facts
  const costs = cashVersusHacked({
    cashEur: plan.cashBaseline.eur,
    taxesEur: trip.taxesEur,
    feesEur: feesFromNetSaving({
      cashEur: plan.cashBaseline.eur,
      taxesEur: trip.taxesEur,
      pointsRequired: plan.pointsRequired,
      currency: plan.awardCurrency,
      netSavingEur: plan.netSavingEur,
    }),
  })

  useEffect(() => {
    setThread([])
    setDraft('')
    setChatNotice(null)
    setSummary(null)
    setSummaryState('loading')
    const id = ++requestId.current
    const timer = window.setTimeout(() => {
      void explainPlan({ facts: factsRef.current, locale }).then((result) => {
        if (id !== requestId.current) return
        if (result.ok) {
          setSummary(result.text)
          setSummaryState('ready')
          return
        }
        setSummary(null)
        setSummaryState(result.reason === 'rate_limited' ? 'rate_limited' : 'unavailable')
      })
    }, DEBOUNCE_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [fingerprint, locale])

  async function onSend(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || asking) return
    const nextThread: ChatTurn[] = [...thread, { role: 'user', text }]
    setThread(nextThread)
    setDraft('')
    setAsking(true)
    setChatNotice(null)
    const result = await askPlan({ facts, locale, messages: nextThread })
    setAsking(false)
    if (result.ok) {
      setThread((prev) => [...prev, { role: 'assistant', text: result.text }])
      return
    }
    if (result.reason === 'rate_limited') setChatNotice(RATE_LIMITED)
    else setChatNotice(UNAVAILABLE)
  }

  return (
    <article className="panel">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a39182]">In brief</p>
      <p className="mt-3 font-mono text-sm font-semibold tracking-tight text-ink">
        {formatPoints(plan.reachableAtReadyBy)}
        <span className="font-sans font-normal text-[#76675c]"> of </span>
        {formatPoints(plan.pointsRequired)}
        <span className="font-sans font-normal text-[#76675c]"> by {formatPlanDate(plan.readyByDate)}</span>
        <span className="font-sans font-normal text-[#76675c]"> · </span>
        {formatEuro(costs.realCostEur)}
        <span className="font-sans font-normal text-[#76675c]"> cash · </span>
        {formatEuro(costs.hackedCostEur)}
        <span className="font-sans font-normal text-[#76675c]"> hacked</span>
      </p>
      {summaryState === 'loading' ? (
        <div className="mt-3 grid gap-2" aria-busy="true">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <span className="sr-only">Writing summary</span>
        </div>
      ) : summaryState === 'rate_limited' ? (
        <p className="mt-3 text-sm text-[#76675c]">{RATE_LIMITED}</p>
      ) : summaryState === 'unavailable' ? (
        <p className="mt-3 text-sm text-[#76675c]">{UNAVAILABLE}</p>
      ) : (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink" aria-live="polite">
          {summary}
        </p>
      )}

      <form className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={onSend}>
        <label className="block min-w-0 flex-1 text-sm font-semibold" htmlFor="plan-question">
          Ask a question
          <input
            id="plan-question"
            className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={800}
            autoComplete="off"
            placeholder="Why this card mix?"
          />
        </label>
        <Button type="submit" variant="outline" disabled={asking || !draft.trim()}>
          {asking ? 'Sending…' : 'Send'}
        </Button>
      </form>

      {thread.length ? (
        <ul className="mt-4 grid gap-3">
          {thread.map((turn, index) => (
            <li key={`${turn.role}-${index}`} className="text-sm leading-6">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a39182]">
                {turn.role === 'user' ? 'You' : 'Answer'}
              </p>
              <p className="mt-1">{turn.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {chatNotice ? <p className="mt-3 text-sm text-[#76675c]">{chatNotice}</p> : null}
    </article>
  )
}
