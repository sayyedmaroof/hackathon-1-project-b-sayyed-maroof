import 'server-only'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { sessions, users } from '@/lib/db/schema'
import { randomToken, sha256 } from './crypto'
import type { SessionUser } from './types'

export const SESSION_COOKIE = 'session'
const SESSION_DAYS = 30

export type { SessionUser }

function sessionCookieOptions(expires: Date) {
  const appUrl = process.env.APP_URL ?? ''
  const secure = appUrl.startsWith('https://') || (!appUrl && process.env.NODE_ENV === 'production')
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    expires,
  }
}

export async function createSession(userId: string): Promise<void> {
  const token = randomToken(32)
  const tokenHash = sha256(token)
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.insert(sessions).values({ userId, tokenHash, expiresAt })
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt))
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token)))
  }
  jar.set(SESSION_COOKIE, '', sessionCookieOptions(new Date(0)))
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  const tokenHash = sha256(token)
  const now = new Date()
  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVerifiedAt: users.emailVerifiedAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .limit(1)
    return rows[0] ?? null
  } catch {
    return null
  }
})

export async function requireVerifiedUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user?.emailVerifiedAt) {
    throw new Error('UNAUTHORIZED')
  }
  return user
}

export async function getClientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? '127.0.0.1'
}
