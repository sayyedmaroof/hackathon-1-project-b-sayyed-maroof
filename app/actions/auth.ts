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
import { sendAccountExistsEmail, sendVerificationEmail } from '@/lib/email/brevo'
import { RESEND_MESSAGE } from '@/lib/auth/constants'

const LOGIN_ERROR = 'Invalid email or password'

let unknownEmailHash: Promise<string> | null = null
function dummyUnknownEmailHash() {
  unknownEmailHash ??= hashPassword('not-a-real-user')
  return unknownEmailHash
}

export type AuthState = { error?: string; message?: string }

function verifySentPath(email: string) {
  return `/verify-email/sent?email=${encodeURIComponent(email)}`
}

async function sendSignupEmail(opts: {
  email: string
  userId: string
  verified: boolean
  isNew: boolean
}) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  if (opts.isNew || !opts.verified) {
    const token = await createEmailVerificationToken(opts.userId)
    await sendVerificationEmail(opts.email, `${appUrl}/verify-email?token=${encodeURIComponent(token)}`)
    return
  }
  await sendAccountExistsEmail(opts.email)
}

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
  const existing = await db
    .select({ id: users.id, emailVerifiedAt: users.emailVerifiedAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  const passwordHash = await hashPassword(password)

  if (existing[0]) {
    await sendSignupEmail({
      email,
      userId: existing[0].id,
      verified: Boolean(existing[0].emailVerifiedAt),
      isNew: false,
    })
    redirect(verifySentPath(email))
  }

  const inserted = await db.insert(users).values({ email, passwordHash, name }).returning({ id: users.id })
  const userId = inserted[0]!.id
  await sendSignupEmail({ email, userId, verified: false, isNew: true })
  redirect(verifySentPath(email))
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

  const rows = await db
    .select({ id: users.id, email: users.email, emailVerifiedAt: users.emailVerifiedAt })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1)
  const user = rows[0]
  if (user && !user.emailVerifiedAt) {
    const token = await createEmailVerificationToken(user.id)
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    await sendVerificationEmail(user.email, `${appUrl}/verify-email?token=${encodeURIComponent(token)}`)
  } else if (user?.emailVerifiedAt) {
    await sendAccountExistsEmail(user.email)
  }
  return { message: RESEND_MESSAGE }
}

export async function confirmEmailVerification(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '')
  const result = await consumeEmailVerificationToken(token)
  if (!result.ok) {
    redirect('/verify-email')
  }
  redirect('/login')
}
