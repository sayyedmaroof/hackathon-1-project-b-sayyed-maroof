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

  it('has copy, program, local image path and valid URLs on every card', () => {
    for (const card of CARD_CATALOG) {
      expect(card.description_es.length).toBeGreaterThan(20)
      expect(card.description_en.length).toBeGreaterThan(10)
      expect(card.programName.length).toBeGreaterThan(2)
      expect(card.imagePath).toMatch(/^\/cards\/[a-z0-9_]+\.(png|jpg)$/)
      expect(card.applyUrl).toMatch(/^https:\/\//)
      expect(() => new URL(card.applyUrl)).not.toThrow()
      expect(card.sourceUrl).toBe('https://aunamilladetudestino.com/tarjetas-de-credito')
      expect(() => new URL(card.sourceUrl)).not.toThrow()
      expect(card.baseEarnPerEur).toBeGreaterThan(0)
      expect(card.welcomeBonusPoints).toBeGreaterThanOrEqual(0)
      expect(card.welcomeBonusMinSpend).toBeGreaterThanOrEqual(0)
      if (card.welcomeBonusPoints > 0) {
        expect(card.welcomeBonusMinSpend).toBeGreaterThan(0)
      }
    }
  })
})

