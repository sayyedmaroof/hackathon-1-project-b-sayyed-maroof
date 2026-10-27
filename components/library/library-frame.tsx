'use client'

import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/button'
import { navigate } from '@/lib/hash-view'

export function LibraryFrame({
  eyebrow,
  title,
  lede,
  action,
  onAction,
  children,
}: {
  eyebrow: string
  title: string
  lede: string
  action: string
  onAction: () => void
  children: ReactNode
}) {
  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.06em]">{title}</h1>
          <p className="mt-3 text-[#76675c]">{lede}</p>
        </div>
        <Button variant="terra" onClick={onAction}>
          <Plus className="size-4" />
          {action}
        </Button>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </>
  )
}

export function EmptyCard({ title, detail, action, onAction }: { title: string; detail: string; action: string; onAction: () => void }) {
  return (
    <article className="panel min-h-48">
      <span className="status">Empty</span>
      <h2 className="mt-10 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[#76675c]">{detail}</p>
      <Button variant="outline" className="mt-6" onClick={onAction}>
        {action}
      </Button>
    </article>
  )
}

export function Promo() {
  return (
    <article className="panel min-h-48 bg-[#2a211b] text-[#fffaf2]">
      <Sparkles className="size-5 text-[#d89a70]" />
      <h2 className="mt-8 text-2xl font-semibold">Make your next trip smarter.</h2>
      <p className="mt-2 text-sm leading-6 text-[#c4b5a7]">Explore options tailored to your points and preferences.</p>
      <button onClick={() => navigate('planner')} className="mt-6 text-sm font-semibold text-[#d89a70]">
        Open planner <ArrowRight className="ml-1 inline size-4" />
      </button>
    </article>
  )
}
