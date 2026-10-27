'use client'

export function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-3 text-sm text-primary-foreground" role="status" aria-live="polite">
      {message}
    </div>
  )
}
