'use client'

import { useEffect } from 'react'
import type { ToastPayload } from '@/lib/toast-messages'
import { cn } from '@/lib/utils'

export function Toast({ toast, onDismiss }: { toast: ToastPayload | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(onDismiss, 2400)
    return () => window.clearTimeout(id)
  }, [toast, onDismiss])

  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed bottom-6 left-1/2 z-50 max-w-[min(92vw,420px)] -translate-x-1/2 rounded-full px-4 py-2.5 text-center text-sm font-semibold shadow-xl',
        toast.variant === 'error' ? 'bg-[#cf3d2e] text-[#fffaf2]' : 'bg-[#2a211b] text-[#fffaf2]',
      )}
    >
      {toast.message}
    </div>
  )
}
