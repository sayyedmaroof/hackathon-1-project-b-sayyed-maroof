import Link from 'next/link'
import { AuthFormShell } from '@/components/auth-form-shell'
import { verifyEmailToken } from '@/app/actions/auth'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const result = token ? await verifyEmailToken(token) : { ok: false as const, reason: 'missing' }

  return (
    <AuthFormShell
      title={result.ok ? 'Email verified' : 'Verification failed'}
      subtitle={
        result.ok
          ? 'You can sign in and start booking.'
          : 'This link may be expired or already used.'
      }
    >
      {result.ok ? (
        <Link href="/login" className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#b86632] text-sm font-semibold text-white">
          Sign in
        </Link>
      ) : (
        <Link
          href="/verify-email/sent"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#d7c9b9] text-sm font-semibold"
        >
          Request a new link
        </Link>
      )}
    </AuthFormShell>
  )
}
