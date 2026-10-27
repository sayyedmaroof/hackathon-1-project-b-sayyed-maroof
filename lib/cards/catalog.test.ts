import { describe, expect, it } from 'vitest'
import { CARD_CATALOG } from './catalog'
import { TRANSFER_EDGES } from './transfers'
import { POINT_CURRENCY_IDS } from './types'
import { POINT_CURRENCIES } from './currencies'

describe('cards catalog', () => {
  it('lists nine issuer products including revolut', () => {
    expect(CARD_CATALOG).toHaveLength(9)
    expect(CARD_CATALOG.map((c) => c.id)).toContain('revolut')
    expect(CARD_CATALOG.map((c) => c.id)).toContain('miles_and_more_caixabank')
  })

  it('defines all point currencies with centsPerPoint', () => {
    for (const id of POINT_CURRENCY_IDS) {
      expect(POINT_CURRENCIES[id].centsPerPoint).toBeGreaterThan(0)
    }
  })

  it('uses BA as Avios bridge with verified 1:1 edges only between Avios programs', () => {
    const verified = TRANSFER_EDGES.filter((e) => e.verified)
    const aviosIds = new Set(['iberia_avios', 'ba_avios', 'vueling_avios', 'qatar_avios'])
    for (const e of verified) {
      expect(aviosIds.has(e.from)).toBe(true)
      expect(aviosIds.has(e.to)).toBe(true)
    }
    expect(verified.some((e) => e.from === 'iberia_avios' && e.to === 'ba_avios')).toBe(true)
  })

  it('marks Revolut and Amex transfer edges as unverified', () => {
    const unverified = TRANSFER_EDGES.filter((e) => !e.verified)
    expect(unverified.some((e) => e.from === 'revolut_revpoints')).toBe(true)
    expect(unverified.some((e) => e.from === 'amex_mr')).toBe(true)
  })
})
