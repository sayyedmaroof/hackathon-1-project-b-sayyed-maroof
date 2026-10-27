'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CreditCard, Map, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useI18n } from '@/components/i18n-provider'

export function HomeView() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1 className="mt-4 text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-[1.05] tracking-[-0.05em]">
            {t.home.title} <em className="font-serif font-normal text-primary">{t.home.titleEm}</em>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">{t.home.promise}</p>
          <Link href="/plan" className="mt-6 inline-flex">
            <Button variant="primary">{t.home.cta}</Button>
          </Link>
        </div>
        <div className="relative min-h-[240px] overflow-hidden rounded-3xl border border-border">
          <Image src="/hero-travel.jpg" alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
        </div>
      </section>

      <Card>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{t.home.exampleNote}</p>
        <h2 className="mt-2 text-xl font-semibold">{t.home.example}</h2>
        <p className="mt-2 text-sm text-ink-muted">Madrid → New York · On track · Net saving EUR 420</p>
        <p className="mt-1 text-sm text-ink-muted">Groceries on Iberia Icon · Dining on Amex Gold · Ready by March 2027</p>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: CreditCard, title: t.home.step1, body: t.home.step1body },
          { icon: Map, title: t.home.step2, body: t.home.step2body },
          { icon: CalendarCheck, title: t.home.step3, body: t.home.step3body },
        ].map((step) => (
          <Card key={step.title}>
            <step.icon className="size-6 text-primary" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{step.body}</p>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-semibold">{t.home.what}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          <li className="rounded-2xl border border-border bg-surface p-4">Card-per-category table</li>
          <li className="rounded-2xl border border-border bg-surface p-4">Month chart</li>
          <li className="rounded-2xl border border-border bg-surface p-4">Net saving versus cash</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">{t.home.faqTitle}</h2>
        <dl className="mt-4 grid gap-4">
          <div>
            <dt className="font-semibold">{t.home.faqBookQ}</dt>
            <dd className="mt-1 text-sm text-ink-muted">{t.home.faqBookA}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t.home.faqNumbersQ}</dt>
            <dd className="mt-1 text-sm text-ink-muted">{t.home.faqNumbersA}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t.home.faqFreeQ}</dt>
            <dd className="mt-1 text-sm text-ink-muted">{t.home.faqFreeA}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t.home.faqDataQ}</dt>
            <dd className="mt-1 text-sm text-ink-muted">{t.home.faqDataA}</dd>
          </div>
        </dl>
      </section>

      <p className="text-sm text-ink-muted">{t.home.trust}</p>
    </div>
  )
}
