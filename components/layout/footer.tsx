"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { SampleNote } from "@/components/layout/sample-note";
import { photos, type PhotoId } from "@/lib/photos";
import { siteConfig } from "@/lib/site-config";
import { Link } from "@/i18n/navigation";

/** Site footer. Prices stay in euros. */
export function Footer() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const columns = [
    {
      title: t("product"),
      links: [
        { href: "/chat", label: common("chat") },
        { href: "/hacks", label: common("learn") },
        { href: "/earn", label: common("earn") },
        { href: "/trips", label: common("trips") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/#how", label: t("how") },
        { href: "/pricing", label: common("pricing") },
        { href: "/login", label: common("login") },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {(["cards", "window", "wallet", "city"] as PhotoId[]).map((id) => (
          <div key={id} className="group relative h-28 overflow-hidden md:h-36">
            <Image src={photos[id].src} alt={photos[id].alt} fill sizes="25vw" className="photo-zoom object-cover" />
          </div>
        ))}
      </div>
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            {siteConfig.tagline} {siteConfig.descriptor}
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-medium tracking-[0.16em] text-ink-muted uppercase">{column.title}</p>
            <ul className="mt-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col gap-4 border-t border-line py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-muted">© {siteConfig.name}. {t("rights")}</p>
        <div className="flex items-center gap-3">
          <SampleNote />
        </div>
      </Container>
    </footer>
  );
}
