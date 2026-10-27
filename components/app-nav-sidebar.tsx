'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Bookmark, Map, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

export function AppNavSidebar({
  open,
  onClose,
  loggedIn,
}: {
  open: boolean
  onClose: () => void
  loggedIn: boolean
}) {
  const pathname = usePathname()
  const items: { href: string; label: string; icon: ReactNode }[] = [
    { href: '/plan', label: 'Plan', icon: <Map className="size-4" /> },
    ...(loggedIn ? [{ href: '/plans', label: 'Saved plans', icon: <Bookmark className="size-4" /> }] : []),
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 border-r border-[#e1d6c8] bg-[#fffaf2] p-5 transition-transform lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center justify-between">
        <Logo />
        <button className="min-h-11 min-w-11 lg:hidden" onClick={onClose} aria-label="Close navigation">
          <X className="size-5" />
        </button>
      </div>
      <p className="mb-3 mt-12 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a39182]">Menu</p>
      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn('sidebar-link min-h-11', pathname === href && 'active')}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
