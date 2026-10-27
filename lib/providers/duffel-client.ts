import 'server-only'

import { DuffelError, logDuffelError, parseDuffelError } from './duffel-errors'
import type { DuffelMode } from './types'

export const DUFFEL_BASE = 'https://api.duffel.com'
const OFFER_TIMEOUT_MS = 20_000
const DEFAULT_TIMEOUT_MS = 10_000
const MAX_RETRIES = 2
const MAX_WAIT_MS = 2_000

export type DuffelFetchInit = RequestInit & { timeoutMs?: number }

let sleepFn = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function setDuffelSleep(fn: (ms: number) => Promise<void>): void {
  sleepFn = fn
}

export function duffelModeFromToken(token: string | undefined | null): DuffelMode {
  if (!token) return 'unknown'
  if (token.startsWith('duffel_test_')) return 'test'
  if (token.startsWith('duffel_live_')) return 'live'
  return 'unknown'
}

export function getDuffelApiKey(): string | undefined {
  const key = process.env.DUFFEL_API_KEY
  return key && key.length > 0 ? key : undefined
}

export function getDuffelMode(): DuffelMode {
  return duffelModeFromToken(getDuffelApiKey())
}

export function liveBookingAllowed(): boolean {
  return process.env.DUFFEL_ALLOW_LIVE_BOOKING === 'true'
}

function timeoutFor(path: string, method: string): number {
  if (method === 'POST' && path.startsWith('/air/offer_requests')) return OFFER_TIMEOUT_MS
  if (method === 'GET' && /^\/air\/offers\/[^/?]+/.test(path)) return OFFER_TIMEOUT_MS
  return DEFAULT_TIMEOUT_MS
}

function canRetry(method: string, path: string): boolean {
  if (method === 'POST' && path.startsWith('/air/orders')) return false
  if (method === 'GET') return true
  return method === 'POST' && path.startsWith('/air/offer_requests')
}

function parseRetryWait(res: Response): number | null {
  const retryAfter = res.headers.get('Retry-After')
  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10)
    if (Number.isFinite(seconds)) return Math.min(Math.max(seconds, 0) * 1000, MAX_WAIT_MS)
    const dateMs = Date.parse(retryAfter)
    if (Number.isFinite(dateMs)) return Math.min(Math.max(dateMs - Date.now(), 0), MAX_WAIT_MS)
  }
  const reset = res.headers.get('ratelimit-reset')
  if (reset) {
    const dateMs = Date.parse(reset)
    if (Number.isFinite(dateMs)) return Math.min(Math.max(dateMs - Date.now(), 0), MAX_WAIT_MS)
  }
  return null
}

function backoffMs(attempt: number): number {
  return Math.min(100 * 2 ** attempt + Math.floor(Math.random() * 50), MAX_WAIT_MS)
}

async function readError(res: Response): Promise<DuffelError> {
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  return parseDuffelError(res.status, body, res.headers.get('x-request-id'))
}

export async function duffelFetch<T>(path: string, init?: DuffelFetchInit): Promise<T> {
  const key = getDuffelApiKey()
  if (!key) {
    throw new DuffelError({
      status: 0,
      type: 'authentication_error',
      code: 'missing_key',
      message: 'DUFFEL_API_KEY is not set',
      requestId: '',
    })
  }

  const method = (init?.method ?? 'GET').toUpperCase()
  const timeoutMs = init?.timeoutMs ?? timeoutFor(path, method)
  let lastError: DuffelError | undefined

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(`${DUFFEL_BASE}${path}`, {
        ...init,
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'Duffel-Version': 'v2',
          Authorization: `Bearer ${key}`,
          ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
          ...(init?.headers ?? {}),
        },
      })
      if (res.ok) return (await res.json()) as T

      const error = await readError(res)
      lastError = error
      const retryableStatus = res.status === 429 || res.status >= 500
      if (!retryableStatus || !canRetry(method, path) || attempt === MAX_RETRIES) {
        logDuffelError(error)
        throw error
      }
      await sleepFn(parseRetryWait(res) ?? backoffMs(attempt))
    } catch (e) {
      if (e instanceof DuffelError) throw e
      lastError = new DuffelError({
        status: 0,
        type: 'api_error',
        code: 'network_error',
        message: e instanceof Error ? e.message : 'Network error',
        requestId: '',
      })
      if (!canRetry(method, path) || attempt === MAX_RETRIES) {
        logDuffelError(lastError)
        throw lastError
      }
      await sleepFn(backoffMs(attempt))
    } finally {
      clearTimeout(timer)
    }
  }

  throw lastError ?? new DuffelError({
    status: 0,
    type: 'api_error',
    code: 'unknown',
    message: 'Duffel request failed',
    requestId: '',
  })
}
