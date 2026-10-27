import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Callout({
  tone = 'info',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: 'info' | 'warning' }) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 text-sm',
        tone === 'info' && 'border-border bg-surface text-ink',
        tone === 'warning' && 'border-[#ead2bc] bg-[#fff6ee] text-warning',
        className,
      )}
      {...props}
    />
  )
}
