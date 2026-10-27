export type ToastVariant = 'default' | 'error'

export type ToastPayload = {
  message: string
  variant: ToastVariant
}

export const TOAST_SAVED = 'Saved to your trips'
export const TOAST_REMOVED = 'Removed from your trips'
export const TOAST_COPIED = 'Copied'
export const TOAST_COPY_FAILED = 'Could not copy to clipboard'

export function toastSaved(already = false) {
  return { message: already ? 'Already saved' : TOAST_SAVED, variant: 'default' as const }
}

export function toastRemoved() {
  return { message: TOAST_REMOVED, variant: 'default' as const }
}

export function toastCopied() {
  return { message: TOAST_COPIED, variant: 'default' as const }
}

export function toastError(message: string) {
  return { message, variant: 'error' as const }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through
  }
  return false
}
