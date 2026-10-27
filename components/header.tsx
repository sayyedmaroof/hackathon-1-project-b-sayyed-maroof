'use client'

import { useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/button'
import { Logo } from '@/components/logo'
import { navigate } from '@/lib/hash-view'

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#66584e] lg:flex">
          <button onClick={() => navigate('search')} className="hover:text-[#2a211b]">
            Explore
          </button>
          <a href="#how">How it works</a>
          <a href="#inspiration">Travel inspiration</a>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" onClick={() => navigate('dashboard')}>
            Sign in
          </Button>
          <Button variant="terra" onClick={() => navigate('search')}>
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
            <button
              className="p-3 text-left"
              onClick={() => {
                navigate('search')
                setOpen(false)
              }}
            >
              Explore
            </button>
            <a className="p-3" href="#how">
              How it works
            </a>
            <a className="p-3" href="#inspiration">
              Travel inspiration
            </a>
            <Button
              variant="terra"
              onClick={() => {
                navigate('search')
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
