'use client'

import { ShellLayout } from '@/components/shell-layout'
import { SearchPage } from '@/components/search-page'
import type { SessionUser } from '@/lib/auth/types'
import { AppProvider } from '@/lib/store'

export function SearchRouteClient({ user }: { user: SessionUser | null }) {
  return (
    <AppProvider>
      <ShellLayout user={user}>
        <SearchPage />
      </ShellLayout>
    </AppProvider>
  )
}
