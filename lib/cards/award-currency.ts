import type { PointCurrencyId } from './types'

const BY_AIRLINE_CODE: Record<string, PointCurrencyId> = {
  IB: 'iberia_avios',
  BA: 'ba_avios',
  VY: 'vueling_avios',
  QR: 'qatar_avios',
  UX: 'air_europa_suma',
  LH: 'miles_and_more',
}

/** Maps sample offer airline code to award currency; null if not in catalog (e.g. AF). */
export function awardCurrencyForAirlineCode(code: string): PointCurrencyId | null {
  return BY_AIRLINE_CODE[code.toUpperCase()] ?? null
}

export function awardCurrencyForAirlineName(airline: string): PointCurrencyId | null {
  if (/iberia/i.test(airline)) return 'iberia_avios'
  if (/british airways/i.test(airline)) return 'ba_avios'
  if (/vueling/i.test(airline)) return 'vueling_avios'
  if (/qatar/i.test(airline)) return 'qatar_avios'
  if (/air europa/i.test(airline)) return 'air_europa_suma'
  if (/lufthansa|miles & more/i.test(airline)) return 'miles_and_more'
  return null
}
