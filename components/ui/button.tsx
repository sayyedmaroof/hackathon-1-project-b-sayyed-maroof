import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed',
  secondary: 'bg-ink text-primary-foreground hover:bg-[#44362c]',
  ghost: 'text-ink-muted hover:bg-background',
  destructive: 'bg-danger text-primary-foreground hover:bg-[#732f22]',
  outline: 'border border-border bg-transparent text-ink hover:border-ink',
  terra: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  dark: 'bg-ink text-primary-foreground hover:bg-[#44362c]',
} as const

const sizes = {
  md: 'min-h-11 px-5 text-sm',
  sm: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
} as const

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? '…' : children}
    </button>
  )
}
