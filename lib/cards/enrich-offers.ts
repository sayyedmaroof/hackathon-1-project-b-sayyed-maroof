import { awardCurrencyForAirlineCode } from './award-currency'
import { buildPlan } from './plan'
import type { PointsPlan, UserWallet } from './types'
import type { FlightOffer } from '@/lib/providers/types'

export type OfferWithPlan = {
  offer: FlightOffer
  pointsPlan: PointsPlan | null
  planError?: string
}

export function planForAwardOffer(offer: FlightOffer, wallet: UserWallet): OfferWithPlan {
  if (offer.kind !== 'award' || offer.points <= 0) {
    return { offer, pointsPlan: null }
  }
  const currency = awardCurrencyForAirlineCode(offer.airlineCode)
  if (!currency) {
    const payCash = {
      kind: 'pay_cash' as const,
      description: 'Pay the cash fare',
      pointsAcquired: 0,
      costEur: 0,
      months: 0,
      netSavingEur: 0,
      warnings: ['Award program not in catalog'],
      recommended: true,
    }
    return {
      offer,
      pointsPlan: {
        reachable: 0,
        shortfall: offer.points,
        usedUnverifiedTransfers: false,
        transferNotes: [],
        options: [payCash],
        recommended: payCash,
        illustrativeDataUsed: true,
      },
      planError: 'Award program not in catalog',
    }
  }
  return {
    offer,
    pointsPlan: buildPlan(
      {
        currency,
        pointsRequired: offer.points,
        taxesEur: offer.fees,
        cashPriceEur: offer.cashPrice,
      },
      wallet,
    ),
  }
}

export function enrichAlternativesWithPlans(
  alternatives: FlightOffer[],
  wallet: UserWallet,
): OfferWithPlan[] {
  return alternatives.map((offer) => planForAwardOffer(offer, wallet))
}
