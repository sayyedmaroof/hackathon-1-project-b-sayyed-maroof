'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { userBalances, userCards, userSpendProfile } from '@/lib/db/schema'
import { requireVerifiedUser } from '@/lib/auth/session'
import { loadWalletForUser } from '@/lib/cards/wallet-db'
import {
  saveBalancesSchema,
  saveSpendProfileSchema,
  saveWalletSchema,
  type SaveBalancesInput,
  type SaveSpendProfileInput,
  type SaveWalletInput,
} from '@/lib/cards/schemas'

export async function loadWallet() {
  const user = await requireVerifiedUser()
  return loadWalletForUser(user.id)
}

export async function saveWallet(input: SaveWalletInput) {
  const user = await requireVerifiedUser()
  const parsed = saveWalletSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid card selection.' }

  await db.delete(userCards).where(eq(userCards.userId, user.id))
  if (parsed.data.cards.length > 0) {
    await db.insert(userCards).values(
      parsed.data.cards.map((c) => ({
        userId: user.id,
        cardId: c.cardId,
        revolutPlan: c.revolutPlan,
      })),
    )
  }

  revalidatePath('/wallet')
  revalidatePath('/results')
  return { ok: true as const }
}

export async function saveBalances(input: SaveBalancesInput) {
  const user = await requireVerifiedUser()
  const parsed = saveBalancesSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid balances.' }

  await db.delete(userBalances).where(eq(userBalances.userId, user.id))
  if (parsed.data.balances.length > 0) {
    await db.insert(userBalances).values(
      parsed.data.balances.map((b) => ({
        userId: user.id,
        currency: b.currency,
        balance: b.balance,
      })),
    )
  }

  revalidatePath('/wallet')
  revalidatePath('/results')
  return { ok: true as const }
}

export async function saveSpendProfile(input: SaveSpendProfileInput) {
  const user = await requireVerifiedUser()
  const parsed = saveSpendProfileSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid spend profile.' }

  const data = parsed.data
  await db
    .insert(userSpendProfile)
    .values({
      userId: user.id,
      monthlyTotalEur: data.monthlyTotalEur,
      groceriesEur: data.groceriesEur,
      travelEur: data.travelEur,
      diningEur: data.diningEur,
      fuelEur: data.fuelEur,
      otherEur: data.otherEur,
    })
    .onConflictDoUpdate({
      target: userSpendProfile.userId,
      set: {
        monthlyTotalEur: data.monthlyTotalEur,
        groceriesEur: data.groceriesEur,
        travelEur: data.travelEur,
        diningEur: data.diningEur,
        fuelEur: data.fuelEur,
        otherEur: data.otherEur,
        updatedAt: new Date(),
      },
    })

  revalidatePath('/wallet')
  revalidatePath('/results')
  return { ok: true as const }
}
