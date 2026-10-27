import { AuthFormShell } from '@/components/auth-form-shell'
import { ResendForm } from '@/components/resend-form'
import { VERIFY_SENT_MESSAGE } from '@/lib/auth/constants'

export default async function VerifyEmailSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <AuthFormShell title="Check your email" subtitle={VERIFY_SENT_MESSAGE}>
      <ResendForm email={email} />
    </AuthFormShell>
  )
}
