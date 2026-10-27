'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { createEmailVerificationToken, consumeEmailVerificationToken } from '@/lib/auth/email-token'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { checkRateLimit } from '@/lib/auth/rate-limit'
import { safeNextPath } from '@/lib/auth/next-path'
import { logInSchema, resendSchema, signUpSchema } from '@/lib/auth/schemas'
import { createSession, destroySession, getClientIp } from '@/lib/auth/session'
import { sendVerificationEmail } from '@/lib/email/brevo'

const LOGIN_ERROR = 'Invalid email or password'

let unknownEmailHash: Promise<string> | null = null
function dummyUnknownEmailHash() {
  unknownEmailHash ??= hashPassword('not-a-real-user')
  return unknownEmailHash
}

export type AuthState = { error?: string; message?: string }

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await getClientIp()
  const limited = checkRateLimit(ip, 'signup')
  if (!limited.ok) return { error: 'Too many attempts. Try again later.' }

  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const { email, password, name } = parsed.data
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing[0]) {
    return { message: 'If this email is new, check your inbox to verify your account.' }
  }

  const passwordHash = await hashPassword(password)
  const inserted = await db.insert(users).values({ email, passwordHash, name }).returning({ id: users.id })
  const userId = inserted[0]!.id
  const token = await createEmailVerificationToken(userId)
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  await sendVerificationEmail(email, `${appUrl}/verify-email?token=${encodeURIComponent(token)}`)
  redirect(`/verify-email/sent?email=${encodeURIComponent(email)}`)
}

export async function logIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await getClientIp()
  const limited = checkRateLimit(ip, 'login')
  if (!limited.ok) return { error: 'Too many attempts. Try again later.' }

  const parsed = logInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: LOGIN_ERROR }

  const { email, password } = parsed.data
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const user = rows[0]
  const hash = user?.passwordHash ?? (await dummyUnknownEmailHash())
  const passwordOk = await verifyPassword(password, hash)
  if (!user || !passwordOk) {
    return { error: LOGIN_ERROR }
  }
  if (!user.emailVerifiedAt) {
    return { error: 'Verify your email before signing in.', message: email }
  }
  await createSession(user.id)
  revalidatePath('/', 'layout')
  const next = safeNextPath(formData.get('next')?.toString(), '/')
  redirect(next)
}

export async function logOut(): Promise<void> {
  await destroySession()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resendVerification(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await getClientIp()
  const limited = checkRateLimit(ip, 'resend')
  if (!limited.ok) return { error: 'Too many attempts. Try again later.' }

  const parsed = resendSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { error: 'Enter a valid email.' }

  const rows = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1)
  const user = rows[0]
  if (user && !user.emailVerifiedAt) {
    const token = await createEmailVerificationToken(user.id)
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    await sendVerificationEmail(user.email, `${appUrl}/verify-email?token=${encodeURIComponent(token)}`)
  }
  return { message: 'If an unverified account exists, we sent a new link.' }
}

export async function verifyEmailToken(token: string): Promise<{ ok: boolean; reason?: string }> {
  if (!token) return { ok: false, reason: 'missing' }
  const result = await consumeEmailVerificationToken(token)
  if (!result.ok) return { ok: false, reason: result.reason }
  return { ok: true }
}

export async function confirmEmailVerification(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '')
  const result = await consumeEmailVerificationToken(token)
  if (!result.ok) {
    redirect('/verify-email')
  }
  redirect('/login')
}
