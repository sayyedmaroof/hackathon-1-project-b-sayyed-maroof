import type { CatalogCardId, PointCurrencyId, SpendCategory } from '@/lib/cards/types'
import type { CashBaseline, CashBaselineSource } from './cash-baseline'
import type { CategoryAssignment, UnusedCard } from './allocate'

export type PlanStatus = 'ready_now' | 'on_track' | 'short' | 'unreachable'

export type PlanVerdict = 'great' | 'good' | 'poor'

export type SuggestionKind =
  | 'reallocate'
  | 'add_card'
  | 'top_up'
  | 'cheaper_trip'
  | 'pay_cash'

export type PlanSuggestion = {
  kind: SuggestionKind
  reason: string
  netSavingEur: number
  extraPoints?: number
  cardId?: CatalogCardId
  tripId?: string
}

export type MonthRow = {
  monthIndex: number
  date: string
  pointsEarnedByCard: Record<string, number>
  cumulativePointsInTripCurrency: number
}

export type SpendPlan = {
  tripId: string
  status: PlanStatus
  message: string
  monthsAvailable: number
  readyByDate: string
  shortfall: number
  reachableAtReadyBy: number
  monthTargetReached: number | null
  assignments: CategoryAssignment[]
  unusedCards: UnusedCard[]
  schedule: MonthRow[]
  netSavingEur: number
  verdict: PlanVerdict
  cashSource: CashBaselineSource
  cashBaseline: CashBaseline
  suggestions: PlanSuggestion[]
  usedUnverifiedData: boolean
  pointsRequired: number
  awardCurrency: PointCurrencyId
}

export type RankedTrip = {
  tripId: string
  status: PlanStatus
  netSavingEur: number
  shortfall: number
  pointsRequired: number
  cashSource: CashBaselineSource
}

export type TripRanking = {
  best: RankedTrip | null
  reachable: RankedTrip[]
  almost: RankedTrip[]
  outOfReach: RankedTrip[]
}

export type SpendCategoryKey = SpendCategory
