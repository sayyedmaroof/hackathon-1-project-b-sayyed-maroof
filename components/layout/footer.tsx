"use client";

import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { SampleNote } from "@/components/layout/sample-note";
import { siteConfig } from "@/lib/site-config";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

/** Site footer with a locale switch. Prices stay in euros. */
export function Footer() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
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
          <div className="flex rounded-full border border-line p-1" role="group" aria-label={common("language")}>
            {(["es", "en"] as const).map((locale) => (
              <button
                key={locale}
                type="button"
                className="min-h-11 rounded-full px-3 text-sm"
                onClick={() => router.replace(pathname, { locale })}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
