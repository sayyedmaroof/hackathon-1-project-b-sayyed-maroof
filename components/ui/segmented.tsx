import { cn } from '@/lib/utils'

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-border p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cn(
            'min-h-11 rounded-full px-4 text-sm font-semibold',
            value === opt.value ? 'bg-ink text-primary-foreground' : 'text-ink-muted',
          )}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
