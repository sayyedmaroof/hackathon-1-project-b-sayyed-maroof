import { redirect } from 'next/navigation'
import { AuthFormShell } from '@/components/auth-form-shell'
import { LoginForm } from '@/components/login-form'
import { getCurrentUser } from '@/lib/auth/current-user'
import { safeNextPath } from '@/lib/auth/next-path'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next: rawNext } = await searchParams
  const next = safeNextPath(rawNext, '/')
  const user = await getCurrentUser()
  if (user) redirect(next)

  return (
    <AuthFormShell title="Sign in" subtitle="Save your plans. Spend planning does not require an account.">
      <LoginForm next={rawNext ? next : undefined} />
    </AuthFormShell>
  )
}
