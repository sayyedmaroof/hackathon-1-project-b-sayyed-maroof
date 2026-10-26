import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RiskLabel } from "@/components/fare/risk-label";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { listHacks } from "@/lib/api/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return { title: t("learnTitle"), description: t("learnBody") };
}

export default async function HacksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  const hacks = listHacks(locale);
  return (
    <Container className="py-12 md:py-16">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">{t("learn")}</p>
      <h1 className="mt-2 max-w-2xl font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-[-0.04em]">
        {t("learnTitle")}
      </h1>
      <p className="mt-3 max-w-xl text-ink-muted">{t("learnBody")}</p>
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
