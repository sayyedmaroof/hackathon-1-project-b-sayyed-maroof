'use server'

import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireVerifiedUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { savedPlans } from '@/lib/db/schema'
import { CUSTOM_TRIP_ID, tripIds } from '@/lib/trips/catalog'

const saveSchema = z.object({
  tripId: z.string().refine((id) => id === CUSTOM_TRIP_ID || tripIds().includes(id)),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  readyByDays: z.number().int().min(30).max(330),
  netSavingEur: z.number().finite(),
  cashSource: z.enum(['sample', 'duffel_live', 'duffel_test']),
  fetchedAt: z.string().datetime().optional(),
})

export async function savePlan(input: z.infer<typeof saveSchema>) {
  const user = await requireVerifiedUser()
  const parsed = saveSchema.safeParse(input)
  if (!parsed.success) return { error: 'Could not save this plan.' }
  await db.insert(savedPlans).values({
    userId: user.id,
    tripId: parsed.data.tripId,
    travelDate: parsed.data.travelDate,
    readyByDays: parsed.data.readyByDays,
    netSavingEur: parsed.data.netSavingEur.toFixed(2),
    cashSource: parsed.data.cashSource,
    fetchedAt: parsed.data.fetchedAt ? new Date(parsed.data.fetchedAt) : null,
  })
  return { ok: true as const }
}

export async function listSavedPlans() {
  const user = await requireVerifiedUser()
  return db.select().from(savedPlans).where(eq(savedPlans.userId, user.id)).orderBy(desc(savedPlans.createdAt))
}
