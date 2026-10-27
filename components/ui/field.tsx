import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Field({
  label,
  hint,
  error,
  prefix,
  suffix,
  children,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
  prefix?: ReactNode
  suffix?: ReactNode
  children?: ReactNode
}) {
  const id = props.id ?? props.name
  return (
    <label className="block text-sm font-semibold" htmlFor={id}>
      {label}
      <span className="mt-1 flex min-h-11 items-center rounded-xl border border-border bg-surface px-3">
        {prefix ? <span className="pr-2 text-ink-muted">{prefix}</span> : null}
        {children ?? <input id={id} className={cn('min-h-11 w-full bg-transparent outline-none', props.className)} {...props} />}
        {suffix ? <span className="pl-2 text-ink-muted">{suffix}</span> : null}
      </span>
      {hint && !error ? <span className="mt-1 block font-normal text-ink-muted">{hint}</span> : null}
      {error ? (
        <span className="mt-1 block font-normal text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}
