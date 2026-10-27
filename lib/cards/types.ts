export const POINT_CURRENCY_IDS = [
  'revolut_revpoints',
  'iberia_avios',
  'ba_avios',
  'qatar_avios',
  'vueling_avios',
  'amex_mr',
  'air_europa_suma',
  'miles_and_more',
] as const

export type PointCurrencyId = (typeof POINT_CURRENCY_IDS)[number]

export type SpendCategory = 'groceries' | 'travel' | 'dining' | 'fuel' | 'other'

export type CategoryEarn = Partial<Record<SpendCategory, number>>

export type TransferEdge = {
  from: PointCurrencyId
  to: PointCurrencyId
  ratio: number
  minAmount: number
  increment: number
  notes?: string
  verified: boolean
}

export type CatalogCardId =
  | 'iberia_icon'
  | 'iberia_icon_aire'
  | 'iberia_zenit_gold'
  | 'revolut'
  | 'amex_platinum'
  | 'amex_gold'
  | 'air_europa_bankinter'
  | 'vueling_up'
  | 'miles_and_more_caixabank'

export type RevolutPlanId = 'premium' | 'metal' | 'ultra'

export type CatalogCard = {
  id: CatalogCardId
  name: string
  issuer: string
  currency: PointCurrencyId
  description_es: string
  description_en: string
  programName: string
  applyUrl: string
  imagePath: string
  baseEarnPerEur: number
  categoryEarn?: CategoryEarn
  monthlyCapPoints: number | null
  annualFeeEur: number | null
  monthlyFeeEur: number | null
  welcomeBonusPoints: number
  welcomeBonusMinSpend: number
  sourceUrl: string
  verified: boolean
}

export type UserCard = {
  cardId: CatalogCardId
  revolutPlan: RevolutPlanId | null
}

export type UserBalance = {
  currency: PointCurrencyId
  balance: number
}

export type UserSpendProfile = {
  monthlyTotalEur: number
  groceriesEur: number
  travelEur: number
  diningEur: number
  fuelEur: number
  otherEur: number
}

export type UserWallet = {
  cards: UserCard[]
  balances: UserBalance[]
  spend: UserSpendProfile
}

export type AwardTarget = {
  currency: PointCurrencyId
  pointsRequired: number
  taxesEur: number
  cashPriceEur: number
}

export type PlanOptionKind =
  | 'book_now'
  | 'earn_with_current_cards'
  | 'top_up'
  | 'new_card_or_plan'
  | 'pay_cash'

export type PlanOption = {
  kind: PlanOptionKind
  description: string
  pointsAcquired: number
  costEur: number
  months: number
  netSavingEur: number
  warnings: string[]
  recommended?: boolean
}

export type PointsPlan = {
  reachable: number
  shortfall: number
  usedUnverifiedTransfers: boolean
  transferNotes: string[]
  options: PlanOption[]
  recommended: PlanOption
  illustrativeDataUsed: boolean
}
