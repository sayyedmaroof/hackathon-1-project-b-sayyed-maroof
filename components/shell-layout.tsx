'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { AppNavSidebar } from '@/components/app-nav-sidebar'
import { LogoutButton } from '@/components/logout-button'
import { userInitials } from '@/lib/auth/display'
import type { SessionUser } from '@/lib/auth/types'

export function ShellLayout({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const greeting = user ? `Hello, ${user.name.split(' ')[0]}` : 'Guide this month’s spend'

  return (
    <div className="min-h-screen bg-[#f7f2e9] text-[#2a211b]">
      <AppNavSidebar open={open} onClose={() => setOpen(false)} loggedIn={Boolean(user)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e1d6c8] bg-[#f7f2e9]/90 px-5 backdrop-blur lg:px-10">
          <button className="min-h-11 min-w-11 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu />
          </button>
          <div className="hidden items-center gap-2 text-sm text-[#76675c] lg:flex">
            <span>{greeting}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <div className="avatar bg-[#d8a283] text-[#2a211b]">{userInitials(user.name)}</div>
                <LogoutButton className="text-sm font-semibold text-[#b86632] min-h-11 px-2" />
              </>
            ) : (
              <Link href="/login" className="min-h-11 inline-flex items-center text-sm font-semibold text-[#b86632]">
                Log in
              </Link>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1320px] p-5 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
