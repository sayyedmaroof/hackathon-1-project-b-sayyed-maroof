import { z } from 'zod'
import { CARD_CATALOG } from './catalog'
import { POINT_CURRENCY_IDS } from './types'

const catalogIds = CARD_CATALOG.map((c) => c.id) as [string, ...string[]]

const balanceAmount = z.coerce.number().int().min(0).max(10_000_000)

const spendAmount = z.coerce.number().int().min(0).max(100_000)

export const saveWalletSchema = z.object({
  cards: z
    .array(
      z.object({
        cardId: z.enum(catalogIds),
        revolutPlan: z.enum(['premium', 'metal', 'ultra']).nullable(),
      }),
    )
    .max(20),
})

export const saveBalancesSchema = z.object({
  balances: z
    .array(
      z.object({
        currency: z.enum(POINT_CURRENCY_IDS),
        balance: balanceAmount,
      }),
    )
    .max(POINT_CURRENCY_IDS.length),
})

export const saveSpendProfileSchema = z.object({
  monthlyTotalEur: spendAmount,
  groceriesEur: spendAmount,
  travelEur: spendAmount,
  diningEur: spendAmount,
  fuelEur: spendAmount,
  otherEur: spendAmount,
})

export type SaveWalletInput = z.infer<typeof saveWalletSchema>
export type SaveBalancesInput = z.infer<typeof saveBalancesSchema>
export type SaveSpendProfileInput = z.infer<typeof saveSpendProfileSchema>
