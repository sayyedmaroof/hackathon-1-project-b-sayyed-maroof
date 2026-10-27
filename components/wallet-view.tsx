'use client'

import { useEffect, useRef, useState } from 'react'
import { saveBalances, saveSpendProfile, saveWallet } from '@/app/actions/wallet'
import { Toast } from '@/components/toast'
import { WalletBalancesPanel } from '@/components/wallet/wallet-balances-panel'
import { WalletCardsPanel } from '@/components/wallet/wallet-cards-panel'
import { WalletSpendPanel } from '@/components/wallet/wallet-spend-panel'
import { POINT_CURRENCY_IDS } from '@/lib/cards/types'
import type { CatalogCardId, RevolutPlanId, UserSpendProfile, UserWallet } from '@/lib/cards/types'
import type { ToastPayload } from '@/lib/toast-messages'

function buildCardRows(cards: UserWallet['cards'], revolutPlan: RevolutPlanId | '') {
  return cards.map((c) => ({
    cardId: c.cardId,
    revolutPlan: c.cardId === 'revolut' ? (revolutPlan || c.revolutPlan || 'premium') : c.revolutPlan,
  }))
}

function walletSnapshot(
  cards: UserWallet['cards'],
  revolutPlan: RevolutPlanId | '',
  balances: Record<string, number>,
  spend: UserSpendProfile,
): string {
  return JSON.stringify({
    cards: buildCardRows(cards, revolutPlan),
    balances: POINT_CURRENCY_IDS.map((currency) => balances[currency] ?? 0),
    spend,
  })
}

function initialBalances(initial: UserWallet): Record<string, number> {
  const m: Record<string, number> = {}
  for (const id of POINT_CURRENCY_IDS) m[id] = 0
  for (const b of initial.balances) m[b.currency] = b.balance
  return m
}

export function WalletView({ initial }: { initial: UserWallet }) {
  const initRevolut = initial.cards.find((c) => c.cardId === 'revolut')?.revolutPlan ?? ''
  const initBalances = initialBalances(initial)

  const [cards, setCards] = useState(initial.cards)
  const [revolutPlan, setRevolutPlan] = useState<RevolutPlanId | ''>(initRevolut)
  const [balances, setBalances] = useState(initBalances)
  const [spend, setSpend] = useState(initial.spend)
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'pending' | 'saved'>('idle')

  const lastSavedRef = useRef(walletSnapshot(initial.cards, initRevolut, initBalances, initial.spend))
  const saveInFlightRef = useRef(false)

  const selectedIds = new Set(cards.map((c) => c.cardId)) as Set<CatalogCardId>

  useEffect(() => {
    const snapshot = walletSnapshot(cards, revolutPlan, balances, spend)
    if (snapshot === lastSavedRef.current) return

    setSaveState('pending')
    const timer = window.setTimeout(() => {
      const latest = walletSnapshot(cards, revolutPlan, balances, spend)
      if (latest === lastSavedRef.current || saveInFlightRef.current) return

      saveInFlightRef.current = true
      void (async () => {
        const cardRows = buildCardRows(cards, revolutPlan)
        const w = await saveWallet({ cards: cardRows })
        if ('error' in w && w.error) {
          setToast({ message: w.error, variant: 'error' })
          setSaveState('idle')
          saveInFlightRef.current = false
          return
        }
        const b = await saveBalances({
          balances: POINT_CURRENCY_IDS.map((currency) => ({
            currency,
            balance: balances[currency] ?? 0,
          })),
        })
        if ('error' in b && b.error) {
          setToast({ message: b.error, variant: 'error' })
          setSaveState('idle')
          saveInFlightRef.current = false
          return
        }
        const s = await saveSpendProfile(spend)
        if ('error' in s && s.error) {
          setToast({ message: s.error, variant: 'error' })
          setSaveState('idle')
          saveInFlightRef.current = false
          return
        }
        lastSavedRef.current = latest
        saveInFlightRef.current = false
        setSaveState('saved')
        setToast({ message: 'Wallet saved', variant: 'default' })
        window.setTimeout(() => setSaveState('idle'), 2000)
      })()
    }, 800)

    return () => window.clearTimeout(timer)
  }, [cards, revolutPlan, balances, spend])

  function toggleCard(id: CatalogCardId) {
    setCards((prev) => {
      const has = prev.some((c) => c.cardId === id)
      if (has) return prev.filter((c) => c.cardId !== id)
      return [...prev, { cardId: id, revolutPlan: id === 'revolut' ? revolutPlan || 'premium' : null }]
    })
  }

  const setupComplete = selectedIds.size > 0 && spend.monthlyTotalEur > 0

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Points wallet</p>
          <h1 className="section-title mt-2 text-4xl">Your wallet</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#76675c]">
            Tell us what you hold and how you spend. Award results will show how to close any points gap — without
            suggesting extra spending.
          </p>
        </div>
        <p className="text-sm text-[#76675c]" aria-live="polite">
          {saveState === 'pending' ? (
            <span className="font-semibold text-[#b86632]">Saving…</span>
          ) : saveState === 'saved' ? (
            <span className="font-semibold text-[#647653]">Saved</span>
          ) : setupComplete ? (
            <span className="status">Ready for award paths</span>
          ) : (
            <span>Select at least one card and monthly spend</span>
          )}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <WalletCardsPanel
          selectedIds={selectedIds}
          revolutPlan={revolutPlan}
          onToggle={toggleCard}
          onRevolutPlan={setRevolutPlan}
        />
        <div className="flex flex-col gap-6 lg:col-span-5">
          <WalletBalancesPanel
            balances={balances}
            onChange={(id, value) => setBalances((b) => ({ ...b, [id]: value }))}
          />
          <WalletSpendPanel spend={spend} onChange={setSpend} />
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
