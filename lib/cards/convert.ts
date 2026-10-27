import type { PointCurrencyId, TransferEdge, UserBalance } from './types'

export type ConvertResult = {
  reachable: number
  usedUnverifiedTransfers: boolean
  transferNotes: string[]
}

function transferable(amount: number, edge: TransferEdge): number {
  if (amount < edge.minAmount) return 0
  if (edge.increment <= 1) return amount
  const excess = amount - edge.minAmount
  const blocks = Math.floor(excess / edge.increment)
  return edge.minAmount + blocks * edge.increment
}

function simulateMax(
  balances: UserBalance[],
  target: PointCurrencyId,
  edges: TransferEdge[],
): { amount: number; usedUnverified: boolean; notes: string[] } {
  const pool = new Map<PointCurrencyId, number>()
  for (const b of balances) {
    pool.set(b.currency, (pool.get(b.currency) ?? 0) + Math.max(0, Math.floor(b.balance)))
  }

  let usedUnverified = false
  const notes: string[] = []
  let changed = true
  let guard = 0
  while (changed && guard++ < 50) {
    changed = false
    for (const edge of edges) {
      if (edge.from === target) continue
      const fromAmt = pool.get(edge.from) ?? 0
      const move = transferable(fromAmt, edge)
      if (move <= 0) continue
      const gained = Math.floor(move * edge.ratio)
      if (gained <= 0) continue
      pool.set(edge.from, fromAmt - move)
      pool.set(edge.to, (pool.get(edge.to) ?? 0) + gained)
      if (!edge.verified) usedUnverified = true
      if (edge.notes && !notes.includes(edge.notes)) notes.push(edge.notes)
      changed = true
    }
  }

  return { amount: pool.get(target) ?? 0, usedUnverified, notes }
}

export function convertBalances(
  balances: UserBalance[],
  edges: TransferEdge[],
  targetCurrency: PointCurrencyId,
): ConvertResult {
  const verifiedEdges = edges.filter((e) => e.verified)
  const verified = simulateMax(balances, targetCurrency, verifiedEdges)
  const all = simulateMax(balances, targetCurrency, edges)
  const usedUnverified = all.amount > verified.amount
  return {
    reachable: usedUnverified ? all.amount : verified.amount,
    usedUnverifiedTransfers: usedUnverified,
    transferNotes: usedUnverified ? all.notes : verified.notes,
  }
}

export function shortfall(pointsRequired: number, reachable: number): number {
  const need = Math.max(0, Math.round(pointsRequired))
  return Math.max(0, need - Math.max(0, Math.floor(reachable)))
}
