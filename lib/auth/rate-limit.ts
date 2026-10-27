type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

export type RateLimitAction = 'login' | 'signup' | 'resend'

export function checkRateLimit(ip: string, action: RateLimitAction): { ok: true } | { ok: false; retryAfterSec: number } {
  const key = `${action}:${ip}`
  const now = Date.now()
  const bucket = store.get(key)
  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true }
  }
  if (bucket.count >= MAX_ATTEMPTS) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  bucket.count += 1
  return { ok: true }
}
