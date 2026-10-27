'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUp, type AuthState } from '@/app/actions/auth'
import { AuthField } from '@/components/auth-field'
import { Button } from '@/components/button'
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/constants'

const initial: AuthState = {}

export function SignUpForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signUp, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error ? (
        <p className="rounded-xl border border-[#e8c4b8] bg-[#fff5f2] px-4 py-3 text-sm text-[#8b3a2a]" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl border border-[#d7e8c4] bg-[#f5fff2] px-4 py-3 text-sm text-[#3a5a2a]">{state.message}</p>
      ) : null}
      <AuthField label="Name" name="name" autoComplete="name" required />
      <AuthField label="Email" name="email" type="email" autoComplete="email" required />
      <AuthField label="Password" name="password" type="password" autoComplete="new-password" required />
      <p className="text-xs text-[#8a796b]">At least {MIN_PASSWORD_LENGTH} characters.</p>
      <Button type="submit" variant="terra" className="min-h-11 w-full" disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
      <p className="text-center text-sm text-[#76675c]">
        Already have an account?{' '}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="font-semibold text-[#b86632]">
          Sign in
        </Link>
      </p>
    </form>
  )
}
