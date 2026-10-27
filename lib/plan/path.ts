import { TRANSFER_EDGES } from '@/lib/cards/transfers'
import type { PointCurrencyId, TransferEdge } from '@/lib/cards/types'

export type PathRatio = {
  ratio: number
  verified: boolean
}

function bfs(
  from: PointCurrencyId,
  to: PointCurrencyId,
  edges: TransferEdge[],
): number | null {
  if (from === to) return 1
  const best = new Map<PointCurrencyId, number>()
  const queue: { id: PointCurrencyId; ratio: number }[] = [{ id: from, ratio: 1 }]
  best.set(from, 1)
  while (queue.length) {
    const cur = queue.shift()!
    for (const edge of edges) {
      if (edge.from !== cur.id) continue
      const nextRatio = cur.ratio * edge.ratio
      const prev = best.get(edge.to)
      if (prev != null && prev >= nextRatio) continue
      best.set(edge.to, nextRatio)
      queue.push({ id: edge.to, ratio: nextRatio })
    }
  }
  return best.get(to) ?? null
}

export function transferPathRatio(
  from: PointCurrencyId,
  to: PointCurrencyId,
  edges: TransferEdge[] = TRANSFER_EDGES,
): PathRatio | null {
  if (from === to) return { ratio: 1, verified: true }
  const verified = bfs(from, to, edges.filter((e) => e.verified))
  if (verified != null) return { ratio: verified, verified: true }
  const any = bfs(from, to, edges)
  if (any != null) return { ratio: any, verified: false }
  return null
}
