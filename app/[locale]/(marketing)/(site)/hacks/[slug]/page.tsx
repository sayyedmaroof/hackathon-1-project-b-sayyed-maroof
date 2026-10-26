import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { RiskLabel } from "@/components/fare/risk-label";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getHack, listHackSlugs } from "@/lib/api/content";
import { gallery, photos } from "@/lib/photos";

export function generateStaticParams() {
  return listHackSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const hack = getHack(slug, locale);
  if (!hack) return { title: "Fareflip" };
  const t = await getTranslations({ locale, namespace: "common" });
  return { title: hack.name, description: t("learnBody") };
}

export default async function HackPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const hack = getHack(slug, locale);
  if (!hack) notFound();
  const t = await getTranslations({ locale, namespace: "common" });

  const cover = photos[gallery[slug.length % gallery.length]];

  return (
    <Container className="py-12 md:py-16">
      <div className="relative mb-8 aspect-[16/7] overflow-hidden rounded-[28px]">
        <Image src={cover.src} alt={cover.alt} fill priority sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.04em]">
          {hack.name}
        </h1>
        <RiskLabel risk={hack.risk} />
      </div>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">{hack.why}</p>
      <p className="num mt-4 text-saving">{hack.typicalSaving}</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-3xl">{t("steps")}</h2>
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
          <p className="text-sm leading-relaxed text-ink-muted">{hack.when}</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            {hack.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </section>
      </div>
      <div className="mt-10">
        <Button render={<Link href="/chat" />}>{t("tryTrip")}</Button>
      </div>
    </Container>
  );
}
