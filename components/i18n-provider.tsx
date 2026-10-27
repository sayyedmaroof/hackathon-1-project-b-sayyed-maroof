'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LOCALE_KEY, isLocale, messages, type Locale } from '@/lib/i18n'
import type { Messages } from '@/lib/i18n/en'

const LocaleContext = createContext<{
  locale: Locale
  t: Messages
  setLocale: (locale: Locale) => void
}>({ locale: 'en', t: messages.en, setLocale: () => undefined })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_KEY)
    if (isLocale(stored)) setLocaleState(stored)
  }, [])
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  const setLocale = (next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(LOCALE_KEY, next)
  }
  const value = useMemo(() => ({ locale, t: messages[locale], setLocale }), [locale])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useI18n() {
  return useContext(LocaleContext)
}
