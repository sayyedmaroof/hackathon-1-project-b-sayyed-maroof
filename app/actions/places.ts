'use server'

import { z } from 'zod'
import { getClientIp } from '@/lib/auth/session'
import { getDuffelApiKey } from '@/lib/providers/duffel-client'
import { searchDuffelPlaces } from '@/lib/providers/duffel-places'
import { withDuffelLimit } from '@/lib/providers/duffel-limiter'
import { searchLocalPlaces, type PlaceHit } from '@/lib/plan/places'

const inputSchema = z.object({
  query: z.string().trim().min(2).max(40),
})

const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 80
const hits = new Map<string, number[]>()

function allowPlacesCall(ip: string, now = Date.now()): boolean {
  const key = ip || 'unknown'
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_HITS) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}

export async function searchPlaces(query: string): Promise<PlaceHit[]> {
  const parsed = inputSchema.safeParse({ query })
  if (!parsed.success) return searchLocalPlaces(query)
  const local = searchLocalPlaces(parsed.data.query)
  if (!getDuffelApiKey()) return local
  const ip = await getClientIp()
  if (!allowPlacesCall(ip)) return local
  try {
    const live = await withDuffelLimit(() => searchDuffelPlaces(parsed.data.query))
    return live.length ? live : local
  } catch {
    return local
  }
}
