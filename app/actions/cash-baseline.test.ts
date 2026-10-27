import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetCashBaselineRateLimit } from '@/lib/plan/cash-rate-limit'
import { RATE_LIMIT_FARE_NOTE } from '@/lib/plan/constants'
import { clearSearchCache } from '@/lib/search/cache'

const searchDuffelCash = vi.fn(async (..._args: unknown[]) => [])
const getDuffelApiKey = vi.fn(() => 'duffel_test_x')
const getDuffelMode = vi.fn(() => 'test' as const)

vi.mock('@/lib/auth/session', () => ({
  getClientIp: async () => '203.0.113.9',
}))

vi.mock('@/lib/providers/duffel-client', () => ({
  getDuffelApiKey: () => getDuffelApiKey(),
  getDuffelMode: () => getDuffelMode(),
}))

vi.mock('@/lib/providers/duffel', () => ({
  searchDuffelCash,
}))

describe('getCashBaselines', () => {
  beforeEach(() => {
    resetCashBaselineRateLimit()
    clearSearchCache()
    searchDuffelCash.mockClear()
    searchDuffelCash.mockResolvedValue([])
  })

  it('runs trip lookups in parallel under one rate-limit hit', async () => {
    const { getCashBaselines } = await import('@/app/actions/cash-baseline')
    const started: number[] = []
    searchDuffelCash.mockImplementation(async () => {
      started.push(Date.now())
      await new Promise((r) => setTimeout(r, 40))
      return []
    })
    const items = [
      { tripId: 'mad-jfk-business-return', travelDate: '2027-08-01' },
      { tripId: 'mad-lis-economy-return', travelDate: '2027-08-01' },
      { tripId: 'mad-jnb-business-return', travelDate: '2027-08-01' },
    ]
    const t0 = Date.now()
    await getCashBaselines(items)
    const elapsed = Date.now() - t0
    expect(searchDuffelCash.mock.calls.length).toBeGreaterThan(1)
    expect(elapsed).toBeLessThan(200)
    expect(started[started.length - 1]! - started[0]!).toBeLessThan(120)
  })

  it('counts the rate limit once per request and returns the rate-limit note', async () => {
    const { allowCashBaselineCall } = await import('@/lib/plan/cash-rate-limit')
    for (let i = 0; i < 30; i++) allowCashBaselineCall('203.0.113.9')
    const { getCashBaselines } = await import('@/app/actions/cash-baseline')
    const out = await getCashBaselines([
      { tripId: 'mad-jfk-business-return', travelDate: '2027-08-01' },
      { tripId: 'mad-lis-economy-return', travelDate: '2027-08-01' },
    ])
    expect(searchDuffelCash).not.toHaveBeenCalled()
    expect(out['mad-jfk-business-return']?.note).toBe(RATE_LIMIT_FARE_NOTE)
    expect(out['mad-lis-economy-return']?.rateLimited).toBe(true)
  })
})
