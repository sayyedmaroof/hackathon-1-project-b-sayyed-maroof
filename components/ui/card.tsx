import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={cn('rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]', className)} {...props} />
}
