import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-bold',
        tone === 'success' && 'bg-[#dce8d4] text-success',
        tone === 'warning' && 'bg-[#ead2bc] text-warning',
        tone === 'danger' && 'bg-[#f3d6d0] text-danger',
        tone === 'info' && 'bg-[#d7e4f0] text-info',
        tone === 'neutral' && 'bg-background text-ink-muted',
        className,
      )}
      {...props}
    />
  )
}
