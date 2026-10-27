import { HomeView } from '@/components/home-view'
import { AppProvider } from '@/lib/store'
import { getCurrentUser } from '@/lib/auth/current-user'

export default async function Page() {
  const user = await getCurrentUser()
  return (
    <AppProvider>
      <HomeView user={user} />
    </AppProvider>
  )
}
