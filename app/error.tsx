'use client'

import { Button } from '@/components/ui/button'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-muted">Try again. Your guest plan on this device is unchanged.</p>
      <Button className="mt-6" onClick={reset}>
        Retry
      </Button>
    </div>
  )
}
