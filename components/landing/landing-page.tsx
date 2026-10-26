"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { FlipNumber } from "@/components/fare/flip-number";
import { Marquee } from "@/components/fare/marquee";
import { RouteMap } from "@/components/fare/route-map";
import { BoardingPassCard } from "@/components/fare/boarding-pass";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site-config";

export function LandingPage() {
  const t = useTranslations("landing");
  const common = useTranslations("common");
  const steps = t.raw("steps") as string[];
  const rules = t.raw("rules") as string[];
  const faqs = t.raw("faqs") as [string, string][];

  return (
    <>
      <Section>
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <p className="text-sm text-ink-muted">{t("eyebrow")}</p>
            <h1 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">{t("headline")}</h1>
            <p className="mt-4 max-w-xl text-lg text-ink-muted">{siteConfig.tagline} {t("sub")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href="/chat" />}>{common("start")}</Button>
              <Button variant="outline" render={<Link href="/pricing" />}>{common("pricing")}</Button>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <ChatDemo />
            <div className="mt-4 h-36">
              <RouteMap label={t("mapLabel")} />
            </div>
          </Reveal>
        </Container>
      </Section>
      <Marquee />
      <Section id="how">
        <Container>
          <p className="text-sm text-ink-muted">{t("journey")}</p>
          <h2 className="mt-2 font-display text-4xl">{t("journeyTitle")}</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-line bg-surface p-4">
                <span className="num text-ink-muted">0{index + 1}</span>
                <p className="mt-2 font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <p className="text-sm text-ink-muted">{t("consultant")}</p>
            <h2 className="mt-2 font-display text-4xl">{t("consultantTitle")}</h2>
            <p className="mt-3 max-w-2xl text-sm text-ink-muted">{t("example")}</p>
          </Reveal>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <article className="rounded-[24px] border border-line bg-surface p-5">
              <h3 className="font-display text-2xl">{t("consultant")}</h3>
              <p className="mt-2 text-sm text-ink-muted">{t("consultantBody")}</p>
            </article>
            <article className="rounded-[24px] border border-line bg-surface p-5">
              <h3 className="font-display text-2xl">{t("agentLabel")}</h3>
              <p className="mt-2 text-sm text-ink-muted">{t("agentBody")}</p>
            </article>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <p className="text-sm text-ink-muted">{t("honest")}</p>
          <h2 className="mt-2 font-display text-4xl">{t("honestTitle")}</h2>
          <ul className="mt-6 space-y-2">
            {rules.map((rule) => (
              <li key={rule} className="flex min-h-11 items-center gap-3 rounded-2xl border border-line px-4 text-sm">
                <span aria-hidden="true">✓</span>
                {rule}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">{t("neverMoves")}</p>
        </Container>
      </Section>
      <Section>
        <Container className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[24px] border border-line bg-surface p-6">
            <h2 className="font-display text-3xl">{t("cashTile")}</h2>
            <p className="mt-2 text-sm text-ink-muted">{t("cashBody")}</p>
          </article>
          <article className="rounded-[24px] border border-line bg-surface p-6">
            <h2 className="font-display text-3xl">{t("pricingTitle")}</h2>
            <Button className="mt-4" render={<Link href="/pricing" />}>{common("pricing")}</Button>
          </article>
        </Container>
      </Section>
      <Section>
        <Container>
          <h2 className="font-display text-4xl">{t("faqTitle")}</h2>
          <div className="mt-6 space-y-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-2xl border border-line p-4">
                <summary className="cursor-pointer font-medium">{question}</summary>
                <p className="mt-2 text-sm text-ink-muted">{answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <h2 className="font-display text-4xl">{t("ctaTitle")}</h2>
            <p className="mt-3 max-w-xl text-ink-muted">{t("ctaBody")}</p>
            <Button className="mt-6" render={<Link href="/chat" />}>{common("start")}</Button>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function ChatDemo() {
  const t = useTranslations("landing");
  const reduce = useReducedMotion();
  const tools = t.raw("demoTools") as string[];
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const timer = window.setInterval(() => setStep((current) => (current + 1) % 3), 1800);
    return () => window.clearInterval(timer);
  }, [paused, reduce]);

  const frame = reduce ? 2 : step;

  return (
    <div
      className="rounded-[28px] border border-line bg-surface p-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="rounded-2xl bg-chat-user px-3 py-2 text-sm">{t("demoUser")}</p>
      {frame >= 1 ? (
        <ul className="mt-3 space-y-1 text-sm text-ink-muted">
          {tools.map((tool) => (
            <li key={tool}>{frame === 2 ? "✓" : "…"} {tool}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-ink-muted">{t("demoTool")}</p>
      )}
      {frame === 2 ? <DemoPass cash={t("demoCash")} award={t("demoAward")} route={t("demoRoute")} program={t("demoProgram")} /> : null}
    </div>
  );
}

function DemoPass({
  cash,
  award,
  route,
  program,
}: {
  cash: string;
  award: string;
  route: string;
  program: string;
}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(cash);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setTimeout(() => setValue(award), 700);
    return () => window.clearTimeout(timer);
  }, [award, reduce]);

  return (
    <div className="mt-3">
      <BoardingPassCard>
        <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">{program}</p>
        <h2 className="font-display text-3xl tracking-tight">{route}</h2>
        <p className="mt-3 text-3xl">
          <FlipNumber value={reduce ? award : value} />
        </p>
      </BoardingPassCard>
    </div>
  );
}
