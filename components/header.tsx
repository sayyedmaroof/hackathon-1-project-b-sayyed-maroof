'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'
import type { SessionUser } from '@/lib/auth/types'

export function Header({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#66584e] lg:flex">
          <Link href="/plan" className="hover:text-[#2a211b]">
            Plan
          </Link>
          {user ? (
            <Link href="/plans" className="hover:text-[#2a211b]">
              Saved plans
            </Link>
          ) : null}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <LogoutButton className="min-h-11 inline-flex items-center px-3 text-sm font-semibold text-[#66584e]" />
          ) : (
            <Link href="/login" className="min-h-11 inline-flex items-center px-3 text-sm font-semibold text-[#66584e]">
              Sign in
            </Link>
          )}
          <Link
            href="/plan"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#b86632] px-5 text-sm font-semibold text-white hover:bg-[#a5572a]"
          >
            Plan my spend
          </Link>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="grid size-11 place-items-center rounded-full bg-white/70 lg:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="mx-5 rounded-2xl border border-[#e1d6c8] bg-[#fffaf2] p-4 shadow-xl lg:hidden">
          <div className="flex flex-col gap-2 text-sm">
            <Link className="min-h-11 p-3" href="/plan" onClick={() => setOpen(false)}>
              Plan
            </Link>
            {user ? (
              <>
                <Link className="min-h-11 p-3" href="/plans" onClick={() => setOpen(false)}>
                  Saved plans
                </Link>
                <LogoutButton className="min-h-11 p-3 text-left text-sm font-semibold text-[#b86632]" />
              </>
            ) : (
              <Link className="min-h-11 p-3" href="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            )}
            <Link
              href="/plan"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#b86632] px-5 text-sm font-semibold text-white"
            >
              Plan my spend
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
