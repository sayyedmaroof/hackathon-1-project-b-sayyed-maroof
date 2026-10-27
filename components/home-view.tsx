'use client'

import { ArrowRight, WalletCards } from 'lucide-react'
import { HomePlannerPreview } from '@/components/home-planner-preview'
import { Button } from '@/components/button'
import { Header } from '@/components/header'
import { Logo } from '@/components/logo'
import { Photo } from '@/components/photo'
import { SearchForm } from '@/components/search-form'
import { destinations, sampleFlights } from '@/lib/data'
import { navigate } from '@/lib/hash-view'
import { calculateSavings, formatEuro, formatPct, formatPointsCompact } from '@/lib/savings'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

const steps = [
  ['01', 'Tell us where you want to go.', 'Your destination, dates, and how you like to travel.'],
  ['02', 'Discover your options.', 'We surface cash fares, award flights, and smarter routes.'],
  ['03', 'Compare the real cost.', 'See cash avoided, fees, and the estimated value of your points.'],
  ['04', 'Choose how to book.', 'You stay in control, with every trade-off made clear.'],
]

export function HomeView() {
  const { patchSearch } = useApp()
  const example = sampleFlights[0]
  const savings = calculateSavings(example)
  const bar = Math.max(0, Math.min(100, Math.round(savings.savingPct * 100)))

  return (
    <div className="min-h-screen bg-[#f7f2e9] text-[#2a211b]">
      <Header />
      <main>
        <section className="relative overflow-hidden px-5 pb-10 pt-32 lg:px-8 lg:pt-40">
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
            <div className="relative z-10 max-w-xl animate-rise">
              <div className="eyebrow">
                <WalletCards className="size-3.5" /> POINTS-FIRST TRAVEL INTELLIGENCE
              </div>
              <h1 className="mt-6 text-[clamp(3.3rem,7vw,6.6rem)] font-semibold leading-[.91] tracking-[-.075em]">
                Your miles are worth <em className="font-serif font-normal text-[#b86632]">more.</em>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-[#66584e]">
                Turn balances, transfer partners, and award availability into one clear answer: the smartest way to book your trip.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="terra" onClick={() => navigate('search')}>
                  Check a trip <ArrowRight className="size-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate('loyalty')}>
                  Add your balances
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-3 text-xs text-[#8a796b]">
                <div className="flex -space-x-2">
                  <span className="avatar bg-[#d8a283]">M</span>
                  <span className="avatar bg-[#bdc5a7]">L</span>
                  <span className="avatar bg-[#b8a1b7]">S</span>
                </div>
                <span>
                  <strong className="text-[#2a211b]">Sample data</strong> · Demo prices in this prototype
                </span>
              </div>
            </div>
            <div className="relative min-h-[450px] lg:min-h-[610px]">
              <div className="hero-image animate-float" />
              <div className="absolute -right-4 top-8 z-10 hidden animate-fade-in rounded-2xl border border-white/50 bg-[#fffaf2]/90 p-3 shadow-lg backdrop-blur-sm sm:block">
                <Photo
                  src="/images/window.jpg"
                  alt="Airplane window view above the clouds"
                  className="h-20 w-28 rounded-xl object-cover"
                />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#8e522f]">Go further</p>
              </div>
              <div className="absolute -bottom-2 left-0 z-10 w-[min(330px,85%)] rounded-2xl border border-white/60 bg-[#fffdf9]/95 p-5 shadow-xl backdrop-blur-sm lg:-left-8 lg:bottom-8">
                <div className="flex items-center justify-between text-xs text-[#8a796b]">
                  <span>Sample data</span>
                  <span className="status">Net {formatPct(savings.savingPct)}</span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#8a796b]">Cash fare</p>
                    <p className="text-2xl font-semibold line-through decoration-[#b86632]/60">{formatEuro(example.cash)}</p>
                  </div>
                  <ArrowRight className="mb-2 size-4 text-[#b86632]" />
                  <div className="text-right">
                    <p className="text-xs text-[#8a796b]">Award flight</p>
                    <p className="text-2xl font-semibold">
                      {formatEuro(example.fees)}{' '}
                      <span className="text-sm font-normal text-[#8a796b]">+ {formatPointsCompact(example.points)}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e8d7bf]">
                  <div className="h-full rounded-full bg-[#b86632]" style={{ width: `${bar}%` }} />
                </div>
                <p className="mt-2 text-xs text-[#66584e]">
                  Net saving <strong>{formatEuro(savings.netSaving)} · {formatPct(savings.savingPct)}</strong>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 lg:mt-0">
            <SearchForm />
          </div>
        </section>
        <section id="how" className="bg-[#fffaf2] px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">The smarter way to travel</p>
                <h2 className="section-title">
                  Same trip.
                  <br />
                  <em>Much less money.</em>
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-[#76675c]">
                We put cash fares and points options side by side, so you can make a decision that feels right for you.
              </p>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[#e1d6c8] bg-[#e1d6c8] md:grid-cols-4">
              {steps.map(([num, title, desc]) => (
                <div key={num} className="bg-[#fffaf2] p-7">
                  <span className="font-mono text-xs text-[#b86632]">{num}</span>
                  <h3 className="mt-12 max-w-[180px] text-xl font-semibold leading-tight">{title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[#76675c]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="inspiration" className="px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">Go further</p>
                <h2 className="section-title">Where could you go?</h2>
              </div>
              <button onClick={() => navigate('search')} className="hidden items-center gap-2 text-sm font-semibold text-[#b86632] sm:flex">
                Explore destinations <ArrowRight className="size-4" />
              </button>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {destinations.map((destination, index) => (
                <button
                  key={destination.city}
                  onClick={() => {
                    patchSearch({ destination: `${destination.city} (${destination.code})` })
                    navigate('search')
                  }}
                  className={cn('destination-card group bg-[#c4a484]', index === 1 && 'md:translate-y-8')}
                >
                  <Photo
                    src={destination.image}
                    alt={`${destination.city}, ${destination.country}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5 text-left text-white">
                    <p className="text-xs uppercase tracking-[.16em] text-white/70">{destination.country}</p>
                    <h3 className="mt-1 text-3xl font-semibold tracking-[-.04em]">{destination.city}</h3>
                    <p className="mt-1 text-sm text-white/80">{destination.meta}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-[#2a211b] px-5 py-24 text-[#fffaf2] lg:px-8">
          <div className="mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-[#d89a70]">Your travel co-pilot</p>
              <h2 className="mt-5 max-w-lg text-5xl font-semibold leading-[.98] tracking-[-.06em]">
                What if your next trip started with a <em className="font-serif font-normal text-[#d89a70]">conversation?</em>
              </h2>
              <p className="mt-6 max-w-md leading-7 text-[#c4b5a7]">
                Tell our planner where you want to go, what you have to spend, and what matters most. It will find the possibilities worth exploring.
              </p>
              <Button variant="terra" className="mt-8" onClick={() => navigate('planner')}>
                Try the travel planner <ArrowRight className="size-4" />
              </Button>
            </div>
            <HomePlannerPreview />
          </div>
        </section>
      </main>
      <footer className="bg-[#2a211b] px-5 pb-8 text-[#fffaf2] lg:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-8 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <Logo light />
          <div className="flex flex-wrap gap-5 text-xs text-[#b6a79a]">
            <a href="#how">How it works</a>
            <a href="#inspiration">Inspiration</a>
            <a href="#how">Privacy</a>
            <a href="#how">Terms</a>
          </div>
          <p className="text-xs text-[#8f8176]">© 2026 FareFlip. Demo experience.</p>
        </div>
      </footer>
    </div>
  )
}

