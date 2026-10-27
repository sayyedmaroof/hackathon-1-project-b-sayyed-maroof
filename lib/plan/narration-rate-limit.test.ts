import { beforeEach, describe, expect, it } from 'vitest'
import { allowNarrationCall, resetNarrationRateLimit } from './narration-rate-limit'

describe('narration rate limit', () => {
  beforeEach(() => {
    resetNarrationRateLimit()
  })

  it('flips to denied after the cap', () => {
    const ip = '203.0.113.10'
    const now = 1_700_000_000_000
    for (let i = 0; i < 20; i++) {
      expect(allowNarrationCall(ip, now + i)).toBe(true)
    }
    expect(allowNarrationCall(ip, now + 21)).toBe(false)
    resetNarrationRateLimit()
    expect(allowNarrationCall(ip, now + 22)).toBe(true)
  })
})
