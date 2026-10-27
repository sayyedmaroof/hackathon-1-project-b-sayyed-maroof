import type { ReactNode } from 'react'

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
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-semibold tracking-[-.04em]">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-ink-muted">{subtitle}</p> : null}
      <div className="panel mt-8">{children}</div>
    </div>
  )
}
