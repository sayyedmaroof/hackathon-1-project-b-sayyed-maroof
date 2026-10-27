import type { ReactNode } from 'react'

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="panel">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
