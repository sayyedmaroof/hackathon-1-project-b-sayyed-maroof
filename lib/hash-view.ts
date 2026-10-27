'use client'

import { useSyncExternalStore } from 'react'
import { isView, type View } from '@/lib/types'

const listeners = new Set<() => void>()

function currentView(): View {
  const raw = window.location.hash.replace(/^#/, '')
  return isView(raw) ? raw : 'home'
}

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    window.addEventListener('hashchange', emit)
    window.addEventListener('popstate', emit)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener('hashchange', emit)
      window.removeEventListener('popstate', emit)
    }
  }
}

export function useHashView(): View {
  return useSyncExternalStore(subscribe, currentView, () => 'home')
}

export function navigate(next: View) {
  const base = `${window.location.pathname}${window.location.search}`
  const url = next === 'home' ? base : `${base}#${next}`
  window.history.pushState(null, '', url)
  emit()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
