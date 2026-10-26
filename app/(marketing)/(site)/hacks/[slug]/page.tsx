import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiskLabel } from "@/components/fare/risk-label";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getHack, listHackSlugs } from "@/lib/api/content";
import { planHref } from "@/lib/query";

export function generateStaticParams() {
  return listHackSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hack = getHack(slug);
  if (!hack) return { title: "Hack" };
  return { title: hack.name, description: hack.summary };
}

export default async function HackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hack = getHack(slug);
  if (!hack) notFound();

  return (
    <Container className="py-12 md:py-16">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">{hack.difficulty}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.04em]">
          {hack.name}
        </h1>
        <RiskLabel risk={hack.risk} />
      </div>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">{hack.why}</p>
      <p className="num mt-4 text-saving">{hack.typicalSaving} typical saving</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-3xl">How it works</h2>
          <ol className="mt-4 space-y-3">
            {hack.how.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="num text-ink-muted">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-[24px] border border-line bg-surface p-5">
          <h2 className="font-display text-3xl">When it works best</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{hack.when}</p>
          <h3 className="mt-6 text-sm font-medium">Watch for</h3>
          <ul className="mt-2 space-y-2 text-sm text-ink-muted">
            {hack.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </section>
      </div>
      <div className="mt-10">
        <Button render={<Link href={planHref({ hack: hack.slug })} />}>Try this on a trip</Button>
      </div>
    </Container>
  );
}
