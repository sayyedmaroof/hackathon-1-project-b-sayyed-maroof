import { cn } from '@/lib/utils'

export type StepState = 'done' | 'current' | 'locked'

export function Stepper({
  steps,
}: {
  steps: { label: string; summary?: string; state: StepState; onSelect?: () => void }[]
}) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((step, i) => (
        <li key={step.label}>
          <button
            type="button"
            disabled={step.state === 'locked'}
            onClick={step.onSelect}
            className={cn(
              'min-h-11 rounded-full px-4 text-left text-sm font-semibold disabled:opacity-50',
              step.state === 'current' && 'bg-ink text-primary-foreground',
              step.state === 'done' && 'bg-surface text-ink border border-border',
              step.state === 'locked' && 'bg-background text-ink-muted',
            )}
          >
            {i + 1}. {step.label}
            {step.summary ? <span className="ml-2 font-normal opacity-80">{step.summary}</span> : null}
          </button>
        </li>
      ))}
    </ol>
  )
}
