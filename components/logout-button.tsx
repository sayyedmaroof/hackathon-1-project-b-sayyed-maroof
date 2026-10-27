'use client'

import { logOut } from '@/app/actions/auth'

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logOut}>
      <button type="submit" className={className}>
        Log out
      </button>
    </form>
  )
}
