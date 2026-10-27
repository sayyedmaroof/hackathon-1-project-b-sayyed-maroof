'use server'

import { db } from '@/lib/db'
import { searches } from '@/lib/db/schema'
import { getSessionUser } from '@/lib/auth/session'
import { getCachedSearch, setCachedSearch } from '@/lib/search/cache'
import { runFlightSearch } from '@/lib/search/engine'
import { parseSearchQuery, type ParsedSearchQuery } from '@/lib/search/query-schema'
import type { SearchFlightsResult } from '@/lib/providers/types'

export async function searchFlightsFromParams(
  params: Record<string, string | undefined>,
): Promise<{ query: ParsedSearchQuery | null; result: SearchFlightsResult | null }> {
  const query = parseSearchQuery(params)
  if (!query) return { query: null, result: null }

  const cached = getCachedSearch(query)
  if (cached) return { query, result: cached }

  const result = await runFlightSearch(query)
  setCachedSearch(query, result)

  const user = await getSessionUser()
  await db.insert(searches).values({
    userId: user?.id ?? null,
    origin: query.originCode,
    destination: query.destinationCode,
    departDate: query.depart,
    returnDate: query.returnDate,
    cabin: query.cabin,
  })

  return { query, result }
}
