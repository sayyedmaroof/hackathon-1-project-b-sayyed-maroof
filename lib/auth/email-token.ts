import { eq, and, isNull, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { emailTokens, users } from '@/lib/db/schema'
import { randomToken, sha256 } from './crypto'

const TOKEN_HOURS = 24

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = randomToken(32)
  const tokenHash = sha256(token)
  const expiresAt = new Date(Date.now() + TOKEN_HOURS * 60 * 60 * 1000)
  await db.insert(emailTokens).values({ userId, tokenHash, expiresAt })
  return token
}

export type ConsumeResult = { ok: true; userId: string } | { ok: false; reason: 'invalid' | 'expired' | 'used' }

export async function consumeEmailVerificationToken(token: string): Promise<ConsumeResult> {
  const tokenHash = sha256(token)
  const now = new Date()
  const consumed = await db
    .update(emailTokens)
    .set({ usedAt: now })
    .where(and(eq(emailTokens.tokenHash, tokenHash), isNull(emailTokens.usedAt), gt(emailTokens.expiresAt, now)))
    .returning({ userId: emailTokens.userId })
  const userId = consumed[0]?.userId
  if (!userId) {
    const any = await db.select().from(emailTokens).where(eq(emailTokens.tokenHash, tokenHash)).limit(1)
    if (!any[0]) return { ok: false, reason: 'invalid' }
    if (any[0].usedAt) return { ok: false, reason: 'used' }
    return { ok: false, reason: 'expired' }
  }
  await db.update(users).set({ emailVerifiedAt: now }).where(eq(users.id, userId))
  return { ok: true, userId }
}
