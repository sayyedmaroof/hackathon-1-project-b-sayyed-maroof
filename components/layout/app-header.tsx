"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useCommandPalette } from "@/components/layout/command-palette";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Slim product bar. The phone way around is the bottom tab bar. */
export function AppHeader() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const { setOpen } = useCommandPalette();
  const links = [
    { href: "/chat", label: t("chat") },
    { href: "/trips", label: t("trips") },
    { href: "/earn", label: t("earn") },
    { href: "/wallet", label: t("wallet") },
    { href: "/pricing", label: t("pricing") },
    { href: "/settings", label: t("settings") },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-3">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Product">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-3 text-sm",
                  active ? "bg-ink text-paper" : "text-ink-muted",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("search")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm text-ink-muted"
          >
            <Search className="size-4 md:hidden" aria-hidden="true" />
            <span className="hidden md:inline">{t("search")}</span>
          </button>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
