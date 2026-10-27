import { redirect } from 'next/navigation'
import { AuthFormShell } from '@/components/auth-form-shell'
import { SignUpForm } from '@/components/signup-form'
import { getCurrentUser } from '@/lib/auth/current-user'
import { safeNextPath } from '@/lib/auth/next-path'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next: rawNext } = await searchParams
  const next = safeNextPath(rawNext, '/')
  const user = await getCurrentUser()
  if (user) redirect(next)

  return (
    <AuthFormShell title="Create account" subtitle="We’ll email you a verification link. Spend planning on the home page works without an account.">
      <SignUpForm next={rawNext ? next : undefined} />
    </AuthFormShell>
  )
}
