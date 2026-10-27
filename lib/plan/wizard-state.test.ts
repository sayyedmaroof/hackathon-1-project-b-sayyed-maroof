import { describe, expect, it } from 'vitest'
import {
  cardsStepComplete,
  programBalanceRows,
  toggleCardId,
  walletCardsFromSelection,
} from './wizard-state'

describe('wizard card selection helpers', () => {
  it('toggles cards on and off', () => {
    const one = toggleCardId([], 'iberia_icon')
    expect(one).toEqual(['iberia_icon'])
    expect(toggleCardId(one, 'iberia_icon')).toEqual([])
    expect(toggleCardId(one, 'revolut')).toEqual(['iberia_icon', 'revolut'])
  })

  it('dedupes balances by points program and lists feeding cards', () => {
    const rows = programBalanceRows(['iberia_icon', 'iberia_icon_aire', 'revolut'])
    expect(rows).toHaveLength(2)
    const avios = rows.find((r) => r.currency === 'iberia_avios')
    expect(avios?.cardNames).toEqual(expect.arrayContaining(['Iberia Icon', 'Iberia Icon Aire']))
    expect(rows.find((r) => r.currency === 'revolut_revpoints')?.programName).toMatch(/RevPoints/i)
  })

  it('keeps Revolut plan only on the Revolut card', () => {
    expect(walletCardsFromSelection(['iberia_icon', 'revolut'], 'ultra')).toEqual([
      { cardId: 'iberia_icon', revolutPlan: null },
      { cardId: 'revolut', revolutPlan: 'ultra' },
    ])
  })

  it('requires at least one card to continue', () => {
    expect(cardsStepComplete([])).toBe(false)
    expect(cardsStepComplete(['vueling_up'])).toBe(true)
  })
})
