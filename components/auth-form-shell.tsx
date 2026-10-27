import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'

export function AuthFormShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f7f2e9] px-5 py-16 text-[#2a211b]">
      <div className="mx-auto max-w-md">
        <Logo />
        <h1 className="mt-10 text-3xl font-semibold tracking-[-.04em]">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-[#76675c]">{subtitle}</p> : null}
        <div className="panel mt-8">{children}</div>
      </div>
    </div>
  )
}
