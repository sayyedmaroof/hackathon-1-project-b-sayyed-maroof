'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Heart, Search, WalletCards, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const items: { href: string; label: string; icon: ReactNode }[] = [
  { href: '/', label: 'Home', icon: <Heart className="size-4" /> },
  { href: '/search', label: 'Search', icon: <Search className="size-4" /> },
  { href: '/bookings', label: 'Bookings', icon: <Heart className="size-4" /> },
  { href: '/wallet', label: 'Wallet', icon: <WalletCards className="size-4" /> },
]

export function AppNavSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

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
      <p className="mb-3 mt-12 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a39182]">Menu</p>
      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn('sidebar-link', pathname === href && 'active')}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
