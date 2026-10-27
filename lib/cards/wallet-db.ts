import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { userBalances, userCards, userSpendProfile } from '@/lib/db/schema'
import type { CatalogCardId, PointCurrencyId, RevolutPlanId, UserWallet } from './types'

export async function loadWalletForUser(userId: string): Promise<UserWallet> {
  const [cards, balances, spend] = await Promise.all([
    db.select().from(userCards).where(eq(userCards.userId, userId)),
    db.select().from(userBalances).where(eq(userBalances.userId, userId)),
    db.select().from(userSpendProfile).where(eq(userSpendProfile.userId, userId)).limit(1),
  ])

  const profile = spend[0]
  return {
    cards: cards.map((c) => ({
      cardId: c.cardId as CatalogCardId,
      revolutPlan: (c.revolutPlan as RevolutPlanId | null) ?? null,
    })),
    balances: balances.map((b) => ({
      currency: b.currency as PointCurrencyId,
      balance: b.balance,
    })),
    spend: profile
      ? {
          monthlyTotalEur: profile.monthlyTotalEur,
          groceriesEur: profile.groceriesEur,
          travelEur: profile.travelEur,
          diningEur: profile.diningEur,
          fuelEur: profile.fuelEur,
          otherEur: profile.otherEur,
        }
      : {
          monthlyTotalEur: 0,
          groceriesEur: 0,
          travelEur: 0,
          diningEur: 0,
          fuelEur: 0,
          otherEur: 0,
        },
  }
}
