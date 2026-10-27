'use client'

import { useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/button'
import { Logo } from '@/components/logo'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SessionUser } from '@/lib/auth/types'

export function Header({ user }: { user: SessionUser | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const firstName = user?.name.split(' ')[0]

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#66584e] lg:flex">
          <Link href="/search" className="hover:text-[#2a211b]">
            Search
          </Link>
          <a href="#how">How it works</a>
          <a href="#inspiration">Travel inspiration</a>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link href="/bookings" className="min-h-11 inline-flex items-center px-3 text-sm font-semibold text-[#66584e]">
                {firstName ? `Hi, ${firstName}` : 'Bookings'}
              </Link>
              <LogoutButton className="min-h-11 inline-flex items-center px-3 text-sm font-semibold text-[#66584e]" />
            </>
          ) : (
            <Link href="/login" className="min-h-11 inline-flex items-center px-3 text-sm font-semibold text-[#66584e]">
              Sign in
            </Link>
          )}
          <Button variant="terra" onClick={() => router.push('/search')}>
            Find my savings <ArrowRight className="size-4" />
          </Button>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="grid size-10 place-items-center rounded-full bg-white/70 lg:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="mx-5 rounded-2xl border border-[#e1d6c8] bg-[#fffaf2] p-4 shadow-xl lg:hidden">
          <div className="flex flex-col gap-2 text-sm">
            <Link className="p-3" href="/search" onClick={() => setOpen(false)}>
              Search
            </Link>
            <a className="p-3" href="#how">
              How it works
            </a>
            <a className="p-3" href="#inspiration">
              Travel inspiration
            </a>
            {user ? (
              <>
                <Link className="p-3" href="/bookings" onClick={() => setOpen(false)}>
                  {firstName ? `Hi, ${firstName}` : 'Bookings'}
                </Link>
                <LogoutButton className="min-h-11 p-3 text-left text-sm font-semibold text-[#b86632]" />
              </>
            ) : (
              <Link className="p-3" href="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            )}
            <Button
              variant="terra"
              onClick={() => {
                router.push('/search')
                setOpen(false)
              }}
            >
              Find my savings <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
