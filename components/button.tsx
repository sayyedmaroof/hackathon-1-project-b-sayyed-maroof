import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Button({
  children,
  onClick,
  variant = 'dark',
  className = '',
  type = 'button',
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'dark' | 'terra' | 'outline' | 'ghost'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        variant === 'dark' && 'bg-[#2a211b] text-[#fffaf2] hover:bg-[#44362c]',
        variant === 'terra' && 'bg-[#b86632] text-white hover:bg-[#a5572a]',
        variant === 'outline' && 'border border-[#d7c9b9] bg-transparent text-[#2a211b] hover:border-[#2a211b]',
        variant === 'ghost' && 'text-[#66584e] hover:bg-[#eee4d8]',
        className,
      )}
    >
      {children}
    </button>
  )
}
