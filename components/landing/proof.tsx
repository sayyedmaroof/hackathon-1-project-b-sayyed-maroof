"use client";

import { motion, useReducedMotion } from "motion/react";
import { CountUp } from "@/components/fare/count-up";
import { SampleNote } from "@/components/layout/sample-note";
import { Section } from "@/components/layout/section";
import { listStats } from "@/lib/api/content";

/** Three sample proof points. The numbers are marked as sample in code and on screen. */
export function ProofStrip() {
  const reduce = useReducedMotion();
  const stats = listStats();

  return (
    <Section className="border-b border-line py-12 md:py-16" containerClassName="space-y-4">
      <SampleNote />
      <ul className="grid gap-8 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.li
            key={stat.id}
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
          >
            <p className="font-display text-5xl tracking-[-0.04em] md:text-6xl">
              {stat.prefix ? <span className="text-saving">{stat.prefix}</span> : null}
              <CountUp value={stat.value} />
              {stat.suffix}
            </p>
            <p className="mt-2 max-w-[16rem] text-sm text-ink-muted">{stat.label}</p>
          </motion.li>
        ))}
      </ul>
    </Section>
  );
}
