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

export type SuggestionApply =
  | { kind: 'reallocate' }
  | { kind: 'add_card'; cardId: CatalogCardId }
  | { kind: 'top_up'; points: number }
  | { kind: 'switch_trip'; tripId: string }
  | { kind: 'pay_cash' }

export type SuggestionAfter = {
  status: PlanStatus
  netSavingEur: number
  targetDate?: string
  monthsSaved?: number
  extraPointsPerMonth?: number
  extraPointsOneOff?: number
}

export type SuggestionDelta = {
  statusImproved: boolean
  netSavingEur: number
}

export type PlanSuggestion = {
  kind: SuggestionKind
  reason: string
  after: SuggestionAfter
  delta: SuggestionDelta
  apply: SuggestionApply
}

export type MonthRow = {
  monthIndex: number
  date: string
  pointsEarnedByCard: Record<string, number>
  cumulativePointsInTripCurrency: number
  projected?: boolean
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
  targetReachedDate: string | null
  monthsLate: number | null
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
