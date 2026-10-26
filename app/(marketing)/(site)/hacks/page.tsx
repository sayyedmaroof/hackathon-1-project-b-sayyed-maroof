import type { Metadata } from "next";
import Link from "next/link";
import { RiskLabel } from "@/components/fare/risk-label";
import { Container } from "@/components/layout/container";
import { listHacks } from "@/lib/api/content";

export const metadata: Metadata = {
  title: "The hacks",
  description: "Six ways a normal fare turns into a lower one, and the risk that comes with each.",
};

export default function HacksPage() {
  const hacks = listHacks();
  return (
    <Container className="py-12 md:py-16">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">Learn</p>
      <h1 className="mt-2 max-w-2xl font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-[-0.04em]">
        The hacks, without the jargon.
      </h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {hacks.map((hack) => (
          <li key={hack.slug}>
            <Link href={`/hacks/${hack.slug}`} className="flex flex-col gap-3 py-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-3xl tracking-tight">{hack.name}</h2>
                <p className="mt-1 max-w-xl text-sm text-ink-muted">{hack.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-ink-muted">{hack.difficulty}</span>
                <span className="num text-sm text-saving">{hack.typicalSaving}</span>
                <RiskLabel risk={hack.risk} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
