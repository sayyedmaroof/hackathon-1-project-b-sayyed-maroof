"use client";

import { motion, useReducedMotion } from "motion/react";
import { BoardingPassCard } from "@/components/fare/boarding-pass";
import { Marquee } from "@/components/fare/marquee";
import { PriceCompare } from "@/components/fare/price-compare";
import { RouteMap } from "@/components/fare/route-map";
import { Container } from "@/components/layout/container";
import { SearchCard } from "@/components/search/search-card";
import { Button } from "@/components/ui/button";
import { listShowcaseTrips } from "@/lib/api/content";
import { siteConfig } from "@/lib/site-config";

/** First screen. The saving sits in the ticket, the search sits in front. */
export function Hero() {
  const reduce = useReducedMotion();
  const sample = listShowcaseTrips()[0]!;
  const rise = reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <section className="relative overflow-hidden">
      <Container className="grid items-center gap-10 py-10 md:py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <motion.div {...rise} transition={{ duration: 0.45 }} className="lg:col-span-6">
          <p className="font-display text-2xl italic tracking-tight text-ink">
            {siteConfig.tagline}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.045em] text-balance">
            Same trip. <span className="italic">Far less</span> to pay.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-muted">
            {siteConfig.descriptor}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button render={<a href="#search" />}>Check a trip</Button>
            <Button variant="outline" render={<a href="#how-it-works" />}>
              See how it works
            </Button>
          </div>
        </motion.div>

        <div className="relative lg:col-span-6">
          <div className="pointer-events-none absolute -inset-x-4 -top-8 bottom-0 hidden opacity-90 sm:block" aria-hidden="true">
            <RouteMap className="h-full" />
          </div>
          <motion.div
            className="relative z-0 mb-4 max-sm:pointer-events-none max-sm:absolute max-sm:inset-x-0 max-sm:top-0 max-sm:mb-0"
            aria-hidden="true"
            {...(reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } })}
          >
            <BoardingPassCard className="ml-auto w-full max-w-sm rotate-1 max-sm:max-w-none">
              <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">Sample</p>
              <p className="mt-2 font-display text-3xl">
                {sample.origin} → {sample.destination}
              </p>
              <div className="mt-3">
                <PriceCompare
                  normal={sample.normalPrice}
                  hacked={sample.hackedPrice}
                  percent={sample.savingPct}
                />
              </div>
            </BoardingPassCard>
          </motion.div>
          <div className="relative z-10 max-sm:mt-16">
            <SearchCard />
          </div>
        </div>
      </Container>
      <Marquee />
    </section>
  );
}
