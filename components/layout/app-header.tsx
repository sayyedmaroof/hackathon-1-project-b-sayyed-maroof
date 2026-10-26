"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useCommandPalette } from "@/components/layout/command-palette";
import { cn } from "cn";

const links = [
  { href: "/plan", label: "Plan" },
  { href: "/results", label: "Results" },
  { href: "/trips", label: "Trips" },
  { href: "/wallet", label: "Wallet" },
  { href: "/settings", label: "Settings" },
];

/** Slim product bar. The mobile way around is the bottom tab bar. */
export function AppHeader() {
  const pathname = usePathname();
  const { setOpen } = useCommandPalette();

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
                  active ? "bg-ink text-paper" : "text-ink-muted hover:text-ink",
                )}
                aria-current={active ? "page" : undefined}
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
            aria-label="Search"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm text-ink-muted"
          >
            <Search className="size-4 md:hidden" aria-hidden="true" />
            <span className="hidden md:inline">Search</span>
            <kbd className="num hidden rounded-md border border-line px-1.5 py-0.5 text-[10px] md:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
