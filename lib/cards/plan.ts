import { TRANSFER_EDGES } from './transfers'
import { convertBalances, shortfall } from './convert'
import { buildOptions, pointsWorthAward, rankOptions } from './options'
import { CARD_CATALOG } from './catalog'
import type { AwardTarget, PointsPlan, UserWallet } from './types'

export function buildPlan(target: AwardTarget, wallet: UserWallet, _today: Date = new Date()): PointsPlan {
  const converted = convertBalances(wallet.balances, TRANSFER_EDGES, target.currency)
  const gap = shortfall(target.pointsRequired, converted.reachable)

  const convertToTarget = (balances: { currency: import('./types').PointCurrencyId; balance: number }[]) => {
    return convertBalances(
      balances.map((b) => ({ currency: b.currency, balance: b.balance })),
      TRANSFER_EDGES,
      target.currency,
    ).reachable
  }

  let options = buildOptions(target, wallet, converted.reachable, gap, convertToTarget)
  let ranked = rankOptions(options)
  let recommended = ranked.find((o) => o.recommended) ?? ranked[0]!

  if (!pointsWorthAward(target)) {
    recommended = ranked.find((o) => o.kind === 'pay_cash')!
    ranked = ranked.map((o) => ({
      ...o,
      recommended: o.kind === 'pay_cash',
    }))
  }

  const illustrativeDataUsed =
    converted.usedUnverifiedTransfers ||
    wallet.cards.some((uc) => {
      const card = CARD_CATALOG.find((c) => c.id === uc.cardId)
      return card && !card.verified
    })

  return {
    reachable: converted.reachable,
    shortfall: gap,
    usedUnverifiedTransfers: converted.usedUnverifiedTransfers,
    transferNotes: converted.transferNotes,
    options: ranked,
    recommended,
    illustrativeDataUsed,
  }
}
