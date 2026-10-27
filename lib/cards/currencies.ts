import type { PointCurrencyId } from './types'

export type PointCurrencyMeta = {
  id: PointCurrencyId
  displayName: string
  /** Assumed redemption value in euro cents per point (documented assumption). */
  centsPerPoint: number
}

export const POINT_CURRENCIES: Record<PointCurrencyId, PointCurrencyMeta> = {
  revolut_revpoints: {
    id: 'revolut_revpoints',
    displayName: 'Revolut RevPoints',
    centsPerPoint: 1.0,
  },
  iberia_avios: {
    id: 'iberia_avios',
    displayName: 'Iberia Avios',
    centsPerPoint: 1.2,
  },
  ba_avios: {
    id: 'ba_avios',
    displayName: 'British Airways Avios',
    centsPerPoint: 1.2,
  },
  qatar_avios: {
    id: 'qatar_avios',
    displayName: 'Qatar Privilege Club Avios',
    centsPerPoint: 1.2,
  },
  vueling_avios: {
    id: 'vueling_avios',
    displayName: 'Vueling Avios',
    centsPerPoint: 1.2,
  },
  amex_mr: {
    id: 'amex_mr',
    displayName: 'Amex Membership Rewards',
    centsPerPoint: 1.5,
  },
  air_europa_suma: {
    id: 'air_europa_suma',
    displayName: 'Air Europa SUMA',
    centsPerPoint: 1.0,
  },
  miles_and_more: {
    id: 'miles_and_more',
    displayName: 'Miles & More',
    centsPerPoint: 1.2,
  },
}

export function centsPerPointFor(currency: PointCurrencyId): number {
  return POINT_CURRENCIES[currency].centsPerPoint
}
