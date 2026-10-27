'use server'

import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireVerifiedUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { savedPlans } from '@/lib/db/schema'
import { loadWalletForUser } from '@/lib/cards/wallet-db'
import type { UserWallet } from '@/lib/cards/types'
import { computeSpendPlan } from '@/lib/plan/engine'
import { cashBaselineForTrip } from '@/lib/plan/cash-baseline'
import { CUSTOM_TRIP_ID, getTrip, tripIds } from '@/lib/trips/catalog'

export type SavedPlanInputs = {
  tripId: string
  travelDate: string
  readyByDays: number
  cardIds: string[]
  balances: UserWallet['balances']
  spend: UserWallet['spend']
}

const saveSchema = z.object({
  tripId: z.string().refine((id) => id === CUSTOM_TRIP_ID || tripIds().includes(id)),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  readyByDays: z.number().int().min(30).max(330),
  netSavingEur: z.number().finite().optional(),
  cashSource: z.enum(['sample', 'duffel_live', 'duffel_test']).optional(),
  fetchedAt: z.string().datetime().optional(),
})

export async function savePlan(input: z.infer<typeof saveSchema>) {
  const user = await requireVerifiedUser()
  const parsed = saveSchema.safeParse(input)
  if (!parsed.success) return { error: 'Could not save this plan.' }
  const trip = getTrip(parsed.data.tripId)
  if (!trip) return { error: 'Could not save this plan.' }

  const wallet = await loadWalletForUser(user.id)
  const today = new Date()
  const cashBaseline = cashBaselineForTrip(trip, undefined)
  const plan = computeSpendPlan({
    trip,
    wallet,
    travelDate: parsed.data.travelDate,
    today,
    readyByDaysBefore: parsed.data.readyByDays,
    cashBaseline,
  })
  const inputs: SavedPlanInputs = {
    tripId: parsed.data.tripId,
    travelDate: parsed.data.travelDate,
    readyByDays: parsed.data.readyByDays,
    cardIds: wallet.cards.map((c) => c.cardId),
    balances: wallet.balances,
    spend: wallet.spend,
  }
  const inserted = await db
    .insert(savedPlans)
    .values({
      userId: user.id,
      tripId: parsed.data.tripId,
      travelDate: parsed.data.travelDate,
      readyByDays: parsed.data.readyByDays,
      netSavingEur: plan.netSavingEur.toFixed(2),
      cashSource: plan.cashSource,
      fetchedAt: plan.cashBaseline.fetchedAt ? new Date(plan.cashBaseline.fetchedAt) : null,
      inputs,
    })
    .returning({ id: savedPlans.id })
  return { ok: true as const, id: inserted[0]?.id, netSavingEur: plan.netSavingEur }
}

export async function listSavedPlans() {
  const user = await requireVerifiedUser()
  return db.select().from(savedPlans).where(eq(savedPlans.userId, user.id)).orderBy(desc(savedPlans.createdAt))
}

export async function loadSavedPlan(id: string) {
  const user = await requireVerifiedUser()
  const rows = await db
    .select()
    .from(savedPlans)
    .where(and(eq(savedPlans.id, id), eq(savedPlans.userId, user.id)))
    .limit(1)
  return rows[0] ?? null
}

export async function deletePlan(id: string) {
  const user = await requireVerifiedUser()
  await db.delete(savedPlans).where(and(eq(savedPlans.id, id), eq(savedPlans.userId, user.id)))
  return { ok: true as const }
}
