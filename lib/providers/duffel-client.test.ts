import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { duffelFetch, setDuffelSleep } from './duffel-client'
import rateLimit from './__fixtures__/error-rate-limit.json'

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

describe('duffelFetch retries', () => {
  const env = { ...process.env }

  beforeEach(() => {
    process.env.DUFFEL_API_KEY = 'duffel_test_unit'
    setDuffelSleep(async () => undefined)
  })

  afterEach(() => {
    process.env = { ...env }
    vi.unstubAllGlobals()
    setDuffelSleep((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  })

  it('retries GET on 429 then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(429, rateLimit, { 'Retry-After': '0', 'x-request-id': 'r1' }))
      .mockResolvedValueOnce(jsonResponse(200, { data: { ok: true } }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await duffelFetch<{ data: { ok: boolean } }>('/air/offers?offer_request_id=orq_1')
    expect(result.data.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries GET on 500', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(500, { errors: [{ code: 'api_error', type: 'api_error' }] }))
      .mockResolvedValueOnce(jsonResponse(200, { data: [] }))
    vi.stubGlobal('fetch', fetchMock)
    await duffelFetch('/air/offers?offer_request_id=orq_1')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry client 4xx other than 429', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(422, { errors: [{ code: 'validation_error', type: 'validation_error' }] }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(duffelFetch('/air/offers?offer_request_id=orq_1')).rejects.toMatchObject({ code: 'validation_error' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('never retries POST /air/orders', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(500, { errors: [{ code: 'api_error', type: 'api_error' }] }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(duffelFetch('/air/orders', { method: 'POST', body: '{}' })).rejects.toMatchObject({ status: 500 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries POST /air/offer_requests on 429', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(429, rateLimit, { 'ratelimit-reset': new Date(Date.now() - 1000).toUTCString() }))
      .mockResolvedValueOnce(jsonResponse(200, { data: { id: 'orq_1' } }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await duffelFetch<{ data: { id: string } }>('/air/offer_requests?return_offers=false', {
      method: 'POST',
      body: '{}',
    })
    expect(result.data.id).toBe('orq_1')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
