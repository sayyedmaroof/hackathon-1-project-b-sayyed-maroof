"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "cn";

const links = [
  { href: siteConfig.links.how, label: "How it works" },
  { href: siteConfig.links.hacks, label: "Hacks" },
  { href: siteConfig.links.points, label: "Points" },
];

/** Marketing bar. It tightens and blurs once the page moves. */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-[background-color,border-color,height] duration-300",
        scrolled
          ? "border-line bg-paper/80 backdrop-blur-md"
          : "border-transparent bg-paper/70 backdrop-blur-sm",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between gap-3 transition-[height] duration-300",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Logo />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button render={<Link href={siteConfig.links.start} />}>Start saving</Button>
        </div>
      </Container>
    </header>
  );
}
