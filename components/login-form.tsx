'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { logIn, type AuthState } from '@/app/actions/auth'
import { AuthField } from '@/components/auth-field'
import { Button } from '@/components/button'

const initial: AuthState = {}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(logIn, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.error ? (
        <p className="rounded-xl border border-[#e8c4b8] bg-[#fff5f2] px-4 py-3 text-sm text-[#8b3a2a]" role="alert">
          {state.error}
          {state.message ? (
            <>
              {' '}
              <Link href={`/verify-email/sent?email=${encodeURIComponent(state.message)}`} className="font-semibold underline">
                Resend verification
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      <AuthField label="Email" name="email" type="email" autoComplete="email" required />
      <AuthField label="Password" name="password" type="password" autoComplete="current-password" required />
      <Button type="submit" variant="terra" className="min-h-11 w-full" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-[#76675c]">
        No account?{' '}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} className="font-semibold text-[#b86632]">
          Sign up
        </Link>
      </p>
    </form>
  )
}
