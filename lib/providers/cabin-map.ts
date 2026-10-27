import type { Cabin } from '@/lib/types'

export function cabinToDuffel(cabin: Cabin): string {
  if (cabin === 'Premium Economy') return 'premium_economy'
  if (cabin === 'Business') return 'business'
  if (cabin === 'First') return 'first'
  return 'economy'
}
