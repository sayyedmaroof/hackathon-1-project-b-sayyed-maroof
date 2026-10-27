import { HomeView } from '@/components/home-view'
import { getCurrentUser } from '@/lib/auth/current-user'

export default async function Page() {
  const user = await getCurrentUser()
  return <HomeView user={user} />
}
