import { SearchRouteClient } from '@/components/search-route-client'
import { getCurrentUser } from '@/lib/auth/current-user'

export default async function SearchRoute() {
  const user = await getCurrentUser()
  return <SearchRouteClient user={user} />
}
