"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site-config";

const frames = [
  "Quiero volar en business a Sudáfrica en 90 días",
  "Iberia 85.000 Avios + 214 €",
  "Plaza en enero. Transferir sigue bloqueado.",
];

export function LandingPage() {
  const t = useTranslations("landing");
  const common = useTranslations("common");
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setFrame((current) => (current + 1) % frames.length), 2400);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const steps = t.raw("steps") as string[];
  const rules = t.raw("rules") as string[];
  const faqs = t.raw("faqs") as [string, string][];

  return (
    <>
      <Section>
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm text-ink-muted">{t("eyebrow")}</p>
            <h1 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">{t("headline")}</h1>
            <p className="mt-4 max-w-xl text-lg text-ink-muted">{siteConfig.tagline} {t("sub")}</p>
            <div className="mt-6 flex gap-3">
              <Button render={<Link href="/chat" />}>{common("start")}</Button>
              <Button variant="outline" render={<Link href="/pricing" />}>{common("pricing")}</Button>
            </div>
          </div>
          <div className="rounded-[28px] border border-line bg-surface p-5" aria-hidden="true">
            <p className="rounded-2xl bg-chat-user px-3 py-2 text-sm">{t("demoUser")}</p>
            <p className="mt-4 text-sm">{reduced ? frames[2] : frames[frame]}</p>
            <p className="mt-3 text-xs text-ink-muted">{t("demoTool")}</p>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <p className="text-sm text-ink-muted">{t("journey")}</p>
          <h2 className="mt-2 font-display text-4xl">{t("journeyTitle")}</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-line p-4">
                <span className="num text-ink-muted">0{index + 1}</span>
                <p className="mt-2 font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      <Section>
        <Container className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm text-ink-muted">{t("consultant")}</p>
            <h2 className="mt-2 font-display text-4xl">{t("consultantTitle")}</h2>
          </div>
          <div>
            <p className="text-sm text-ink-muted">{t("honest")}</p>
            <h2 className="mt-2 font-display text-4xl">{t("honestTitle")}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink-muted">{t("neverMoves")}</p>
          </div>
        </Container>
      </Section>
      <Section>
        <Container className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[24px] border border-line p-6">
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
    </>
  );
}
