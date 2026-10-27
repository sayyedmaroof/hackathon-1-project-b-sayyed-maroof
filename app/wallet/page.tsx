import { redirect } from 'next/navigation'
import { ShellLayout } from '@/components/shell-layout'
import { WalletView } from '@/components/wallet-view'
import { getCurrentUser } from '@/lib/auth/current-user'
import { loadWalletForUser } from '@/lib/cards/wallet-db'

export default async function WalletPage() {
  const user = await getCurrentUser()
  if (!user?.emailVerifiedAt) redirect('/login?next=/wallet')

  const wallet = await loadWalletForUser(user.id)

  return (
    <ShellLayout user={user}>
      <WalletView initial={wallet} />
    </ShellLayout>
  )
}
