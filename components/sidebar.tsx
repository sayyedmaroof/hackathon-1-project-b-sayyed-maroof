'use client'

import type { ReactNode } from 'react'
import { BarChart3, Bell, CircleHelp, Heart, LayoutDashboard, MessageCircle, Search, Settings, WalletCards, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { navigate } from '@/lib/hash-view'
import { useApp } from '@/lib/store'
import type { View } from '@/lib/types'
import { cn } from '@/lib/utils'

const items: [View, ReactNode, string][] = [
  ['dashboard', <LayoutDashboard />, 'Overview'],
  ['search', <Search />, 'Find flights'],
  ['planner', <MessageCircle />, 'Travel planner'],
  ['trips', <Heart />, 'Saved trips'],
  ['alerts', <Bell />, 'Price alerts'],
  ['loyalty', <WalletCards />, 'Points & loyalty'],
  ['savings', <BarChart3 />, 'Savings insights'],
]

export function Sidebar({ view, open, onClose }: { view: View; open: boolean; onClose: () => void }) {
  const { showToast } = useApp()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 border-r border-[#e1d6c8] bg-[#fffaf2] p-5 transition-transform lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center justify-between">
        <Logo />
        <button className="lg:hidden" onClick={onClose} aria-label="Close navigation">
          <X className="size-5" />
        </button>
      </div>
      <p className="mb-3 mt-12 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a39182]">Your journeys</p>
      <nav className="flex flex-col gap-1">
        {items.map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => {
              navigate(key)
              onClose()
            }}
            className={cn('sidebar-link', key === view && 'active')}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-8">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a39182]">More</p>
        <button onClick={() => showToast('Coming soon')} className="sidebar-link">
          <Settings /> Settings
        </button>
        <button onClick={() => showToast('Coming soon')} className="sidebar-link">
          <CircleHelp /> Help center
        </button>
      </div>
    </aside>
  )
}
