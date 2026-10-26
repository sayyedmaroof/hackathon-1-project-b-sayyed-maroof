"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BoardingPassCard } from "@/components/fare/boarding-pass";
import { HackBadge } from "@/components/fare/hack-badge";
import { PriceCompare } from "@/components/fare/price-compare";
import { WhyItWorks } from "@/components/fare/why-it-works";
import { SampleNote } from "@/components/layout/sample-note";
import { Section } from "@/components/layout/section";
import { listShowcaseTrips } from "@/lib/api/content";

/** Cycles three sample trips so the flip is obvious without a search. */
export function Showcase() {
  const trips = listShowcaseTrips();
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const trip = trips[index]!;

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % trips.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [reduce, trips.length]);

  return (
    <Section
      eyebrow="See it flip"
      title={
        <>
          The fare you expected. <span className="italic">Then the one you book.</span>
        </>
      }
      description="We keep the normal price on screen. The saving is the point, not a footnote."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col gap-2">
          {trips.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={`min-h-11 rounded-full px-4 text-left text-sm ${
                itemIndex === index ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
              }`}
              aria-pressed={itemIndex === index}
            >
              {item.origin} → {item.destination}
            </button>
          ))}
          <SampleNote className="mt-3" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={trip.id}
            initial={reduce ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <BoardingPassCard
              stub={
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <HackBadge hack={trip.hacks[0]!} />
                  <WhyItWorks text={trip.whyItWorks} />
                </div>
              }
            >
              <p className="text-xs tracking-[0.16em] text-ink-muted uppercase">
                {trip.origin} to {trip.destination}
              </p>
              <div className="mt-4">
                <PriceCompare
                  normal={trip.normalPrice}
                  hacked={trip.hackedPrice}
                  percent={trip.savingPct}
                  size="lg"
                />
              </div>
            </BoardingPassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  );
}
