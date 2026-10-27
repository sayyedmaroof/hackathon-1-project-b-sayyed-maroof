import 'server-only'

import { duffelFetch } from './duffel-client'
import { mapPlaceSuggestions, type DuffelPlaceSuggestion, type PlaceHit } from '@/lib/plan/places'

type SuggestionsResponse = { data?: DuffelPlaceSuggestion[] }

export async function searchDuffelPlaces(query: string): Promise<PlaceHit[]> {
  const json = await duffelFetch<SuggestionsResponse>(
    `/places/suggestions?query=${encodeURIComponent(query)}`,
    { timeoutMs: 4000 },
  )
  return mapPlaceSuggestions(json.data ?? [])
}
