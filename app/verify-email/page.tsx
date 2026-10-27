import Link from 'next/link'
import { AuthFormShell } from '@/components/auth-form-shell'
import { confirmEmailVerification } from '@/app/actions/auth'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token) {
    return (
      <AuthFormShell title="Verification failed" subtitle="This link may be expired or already used.">
        <Link
          href="/verify-email/sent"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#d7c9b9] text-sm font-semibold"
        >
          Request a new link
        </Link>
      </AuthFormShell>
    )
  }

  return (
    <AuthFormShell title="Confirm your email" subtitle="Click once to verify this address and save your plans.">
      <form action={confirmEmailVerification}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#b86632] text-sm font-semibold text-white"
        >
          Confirm email
        </button>
      </form>
    </AuthFormShell>
  )
}
