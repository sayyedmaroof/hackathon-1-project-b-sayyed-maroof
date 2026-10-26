"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "cn";

/** Marketing bar. It tightens once the page moves. */
export function Navbar() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/#how", label: t("how") },
    { href: "/hacks", label: common("learn") },
    { href: "/pricing", label: common("pricing") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-[background-color,border-color] duration-300",
        scrolled ? "border-line bg-paper/80 backdrop-blur-md" : "border-transparent bg-paper/70",
      )}
    >
      <Container className={cn("flex items-center justify-between gap-3", scrolled ? "h-14" : "h-16")}>
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center px-3 text-sm text-ink-muted">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button render={<Link href="/chat" />}>{common("start")}</Button>
        </div>
      </Container>
    </header>
  );
}
