'use client'

import { useState, type ReactNode } from 'react'
import { Bell, Menu } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { navigate, useHashView } from '@/lib/hash-view'

export function AppShell({ children }: { children: ReactNode }) {
  const view = useHashView()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f2e9] text-[#2a211b]">
      <Sidebar view={view} open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e1d6c8] bg-[#f7f2e9]/90 px-5 backdrop-blur lg:px-10">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu />
          </button>
          <div className="hidden items-center gap-2 text-sm text-[#76675c] lg:flex">
            <span>Tuesday, 27 October 2026</span>
            <span className="size-1 rounded-full bg-[#b86632]" />
            <span>Good morning, Maria</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate('alerts')}
              aria-label="Notifications"
              className="grid size-10 place-items-center rounded-full border border-[#dfd2c4] bg-[#fffaf2]"
            >
              <Bell className="size-4" />
              <span className="absolute ml-5 mt-[-18px] size-2 rounded-full bg-[#b86632]" />
            </button>
            <div className="avatar bg-[#d8a283] text-[#2a211b]">MR</div>
          </div>
        </header>
        <main className="mx-auto max-w-[1320px] p-5 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
