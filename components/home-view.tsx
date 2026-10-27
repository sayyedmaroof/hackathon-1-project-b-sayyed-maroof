import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/header'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import type { SessionUser } from '@/lib/auth/types'

const steps = [
  ['01', 'Pick your card', 'Choose the credit or debit card you already have from the Spain catalog.'],
  ['02', 'Pick your trip', 'Select a sample trip from Madrid and the date you want to be ready.'],
  ['03', 'Follow your spend plan', 'See which card to use for each kind of spend, month by month, until your points are ready.'],
]

export function HomeView({ user }: { user: SessionUser | null }) {
  return (
    <div className="min-h-screen bg-[#f7f2e9] text-[#2a211b]">
      <Header user={user} />
      <main>
        <section className="relative overflow-hidden px-5 pb-10 pt-32 lg:px-8 lg:pt-40">
          <div className="mx-auto max-w-[1240px]">
            <div className="eyebrow">Spend planning for travellers in Spain</div>
            <h1 className="mt-6 max-w-3xl text-[clamp(3rem,6vw,5.4rem)] font-semibold leading-[.95] tracking-[-.07em]">
              Get the points for the trip. <em className="font-serif font-normal text-[#b86632]">Then book it yourself.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#66584e]">
              FareFlip is a spend-planning guide. It shows which of your cards to use so you have enough points by
              your ready-by date, and what you net-save versus paying cash. It compares against a current cash fare when
              available.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/plan"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b86632] px-5 text-sm font-semibold text-white hover:bg-[#a5572a]"
              >
                Plan my spend <ArrowRight className="size-4" />
              </Link>
              {user ? null : (
                <Link
                  href="/signup"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7c9b9] px-5 text-sm font-semibold"
                >
                  Save your plans
                </Link>
              )}
            </div>
          </div>
        </section>
        <section id="how" className="px-5 py-16 lg:px-8">
          <div className="mx-auto grid max-w-[1240px] gap-6 lg:grid-cols-3">
            {steps.map(([n, title, copy]) => (
              <div key={n} className="rounded-2xl border border-[#e1d6c8] bg-[#fffaf2] p-6">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a39182]">{n}</p>
                <h2 className="mt-3 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#66584e]">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-[#e1d6c8] px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between">
          <Logo />
          <p className="text-xs text-[#8f8176]">© 2026 FareFlip. Illustrative rates, verify with the issuer.</p>
        </div>
      </footer>
    </div>
  )
}
