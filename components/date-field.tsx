'use client'

import { cn } from '@/lib/utils'

export function DateField({
  label,
  name,
  value,
  error,
  chrome,
  onChange,
}: {
  label: string
  name: string
  value: string
  error?: string
  chrome: 'field' | 'card'
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0">
      <label className={cn(chrome === 'field' ? 'field' : 'input-card', 'relative')}>
        <span>{label}</span>
        <input aria-label={name} type="date" value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 [color-scheme:light]" />
      </label>
      {error && <p className="px-4 pt-1 text-xs text-[#9a4034]">{error}</p>}
    </div>
  )
}
