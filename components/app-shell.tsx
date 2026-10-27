'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented'
import { useI18n } from '@/components/i18n-provider'
import { ILLUSTRATIVE_RATES_LABEL } from '@/lib/cards/constants'
import type { SessionUser } from '@/lib/auth/types'
import type { Locale } from '@/lib/i18n'
import { logOut } from '@/app/actions/auth'

export function AppShell({
  user,
  children,
}: {
  user: SessionUser | null
  children: React.ReactNode
}) {
  const { t, locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const loggedIn = Boolean(user)
  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-4 md:flex" aria-label="Main">
            <Link href="/plan" className="inline-flex min-h-11 items-center font-semibold">
              {t.nav.plan}
            </Link>
            {loggedIn ? (
              <Link href="/plans" className="inline-flex min-h-11 items-center font-semibold">
                {t.nav.saved}
              </Link>
            ) : null}
            <SegmentedControl
              label="Language"
              value={locale}
              onChange={(v: Locale) => setLocale(v)}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' },
              ]}
            />
            {loggedIn ? (
              <form action={logOut}>
                <Button type="submit" variant="ghost">
                  {t.nav.logout}
                </Button>
              </form>
            ) : (
              <Link href="/login" className="inline-flex min-h-11 items-center font-semibold">
                {t.nav.login}
              </Link>
            )}
          </nav>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center md:hidden"
            aria-label={t.nav.menu}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" role="dialog" aria-modal="true">
          <div className="ml-auto h-full w-72 bg-surface p-4">
            <div className="flex justify-end">
              <button type="button" className="min-h-11 min-w-11" aria-label="Close" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              <Link href="/plan" className="min-h-11 font-semibold" onClick={() => setOpen(false)}>
                {t.nav.plan}
              </Link>
              {loggedIn ? (
                <Link href="/plans" className="min-h-11 font-semibold" onClick={() => setOpen(false)}>
                  {t.nav.saved}
                </Link>
              ) : (
                <Link href="/login" className="min-h-11 font-semibold" onClick={() => setOpen(false)}>
                  {t.nav.login}
                </Link>
              )}
              {loggedIn ? (
                <form action={logOut}>
                  <Button type="submit" variant="ghost">
                    {t.nav.logout}
                  </Button>
                </form>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border px-4 py-8 text-sm text-ink-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p>FareFlip</p>
          <Link href="/privacy" className="min-h-11 inline-flex items-center">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="min-h-11 inline-flex items-center">
            {t.footer.terms}
          </Link>
          <p>{t.footer.disclaimer}</p>
          <p>{ILLUSTRATIVE_RATES_LABEL}</p>
          <p>{t.footer.catalog}</p>
          <a href="mailto:hello@fareflip.app" className="min-h-11 inline-flex items-center">
            {t.footer.contact}
          </a>
        </div>
      </footer>
    </div>
  )
}
