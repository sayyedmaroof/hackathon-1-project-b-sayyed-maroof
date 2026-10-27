import { z } from 'zod'
import { matchAirport } from '@/lib/airports'

const cabinSchema = z.enum(['Economy', 'Premium Economy', 'Business', 'First'])

export const searchQuerySchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  depart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cabin: cabinSchema.default('Economy'),
  flexible: z.coerce.boolean().default(false),
  adults: z.coerce.number().int().min(1).max(9).default(1),
})

export type ParsedSearchQuery = z.infer<typeof searchQuerySchema> & {
  originCode: string
  destinationCode: string
}

export function parseSearchQuery(input: Record<string, string | undefined>): ParsedSearchQuery | null {
  const parsed = searchQuerySchema.safeParse({
    origin: input.origin,
    destination: input.destination,
    depart: input.depart,
    returnDate: input.return ?? input.returnDate,
    cabin: input.cabin,
    flexible: input.flexible === '1' || input.flexible === 'true',
    adults: input.adults ?? '1',
  })
  if (!parsed.success) return null
  const originAirport = matchAirport(parsed.data.origin)
  const destAirport = matchAirport(parsed.data.destination)
  if (!originAirport || !destAirport) return null
  if (parsed.data.returnDate < parsed.data.depart) return null
  return {
    ...parsed.data,
    originCode: originAirport.code,
    destinationCode: destAirport.code,
  }
}
