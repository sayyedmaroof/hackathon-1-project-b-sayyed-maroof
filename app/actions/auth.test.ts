import { beforeEach, describe, expect, it, vi } from 'vitest'

const redirect = vi.fn((url: string) => {
  const err = new Error(`REDIRECT:${url}`)
  ;(err as Error & { digest?: string }).digest = 'NEXT_REDIRECT'
  throw err
})

const hashPassword = vi.fn(async (password: string) => `hash:${password}`)
const sendVerificationEmail = vi.fn(async (..._args: unknown[]) => undefined)
const sendAccountExistsEmail = vi.fn(async (..._args: unknown[]) => undefined)
const createEmailVerificationToken = vi.fn(async () => 'token-1')

const limit = vi.fn()
const returning = vi.fn()
const values = vi.fn(() => ({ returning }))
const insert = vi.fn(() => ({ values }))

vi.mock('next/navigation', () => ({ redirect: (...args: unknown[]) => redirect(args[0] as string) }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/password', () => ({
  hashPassword: (password: string) => hashPassword(password),
  verifyPassword: vi.fn(),
}))
vi.mock('@/lib/email/brevo', () => ({
  sendVerificationEmail,
  sendAccountExistsEmail,
}))
vi.mock('@/lib/auth/email-token', () => ({
  createEmailVerificationToken: () => createEmailVerificationToken(),
  consumeEmailVerificationToken: vi.fn(),
}))
vi.mock('@/lib/auth/session', () => ({
  getClientIp: async () => `ip-${Math.random()}`,
  createSession: vi.fn(),
  destroySession: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit,
        }),
      }),
    }),
    insert,
  },
}))

function form(email: string) {
  const data = new FormData()
  data.set('email', email)
  data.set('password', 'supersecret1')
  data.set('name', 'Ada')
  return data
}

describe('signUp email parity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    returning.mockResolvedValue([{ id: 'new-user' }])
  })

  it('hashes and redirects the same for new and existing emails', async () => {
    const { signUp } = await import('@/app/actions/auth')
    limit.mockResolvedValueOnce([])
    let newPath = ''
    try {
      await signUp({}, form('new@example.com'))
    } catch (error) {
      newPath = (error as Error).message
    }

    limit.mockResolvedValueOnce([{ id: 'old-user', emailVerifiedAt: new Date() }])
    let existingPath = ''
    try {
      await signUp({}, form('old@example.com'))
    } catch (error) {
      existingPath = (error as Error).message
    }

    expect(hashPassword).toHaveBeenCalledTimes(2)
    expect(newPath).toBe('REDIRECT:/verify-email/sent?email=new%40example.com')
    expect(existingPath).toBe('REDIRECT:/verify-email/sent?email=old%40example.com')
    expect(sendVerificationEmail).toHaveBeenCalledTimes(1)
    expect(sendAccountExistsEmail).toHaveBeenCalledTimes(1)
  })
})

describe('resendVerification', () => {
  it('returns the same message for unknown, unverified and verified emails', async () => {
    const { RESEND_MESSAGE } = await import('@/lib/auth/constants')
    const { resendVerification } = await import('@/app/actions/auth')
    const data = (email: string) => {
      const f = new FormData()
      f.set('email', email)
      return f
    }
    limit.mockResolvedValueOnce([])
    const unknown = await resendVerification({}, data('nobody@example.com'))
    limit.mockResolvedValueOnce([{ id: 'u1', email: 'open@example.com', emailVerifiedAt: null }])
    const unverified = await resendVerification({}, data('open@example.com'))
    limit.mockResolvedValueOnce([{ id: 'u2', email: 'done@example.com', emailVerifiedAt: new Date() }])
    const verified = await resendVerification({}, data('done@example.com'))
    expect(unknown).toEqual(unverified)
    expect(unverified).toEqual(verified)
    expect(unknown.message).toBe(RESEND_MESSAGE)
  })
})
