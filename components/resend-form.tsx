'use client'

import { useActionState } from 'react'
import { resendVerification, type AuthState } from '@/app/actions/auth'
import { AuthField } from '@/components/auth-field'
import { Button } from '@/components/button'

const initial: AuthState = {}

export function ResendForm({ email }: { email?: string }) {
  const [state, action, pending] = useActionState(resendVerification, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error ? <p className="text-sm text-[#8b3a2a]" role="alert">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-[#3a5a2a]">{state.message}</p> : null}
      <AuthField label="Email" name="email" type="email" defaultValue={email} required />
      <Button type="submit" variant="terra" className="min-h-11 w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Resend verification email'}
      </Button>
    </form>
  )
}
