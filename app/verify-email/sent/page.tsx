import { AuthFormShell } from '@/components/auth-form-shell'
import { ResendForm } from '@/components/resend-form'

export default async function VerifyEmailSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <AuthFormShell title="Check your email" subtitle="Open the verification link we sent to finish signing up.">
      <ResendForm email={email} />
    </AuthFormShell>
  )
}
