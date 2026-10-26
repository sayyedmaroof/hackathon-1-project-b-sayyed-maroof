"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { SampleNote } from "@/components/layout/sample-note";
import { usePreferences } from "@/hooks/use-preferences";
import { siteConfig } from "@/lib/site-config";
import type { CurrencyCode } from "@/lib/types";

const currencies: CurrencyCode[] = ["EUR", "GBP", "USD"];

const columns = [
  {
    title: "Product",
    links: [
      { href: "/plan", label: "Check a trip" },
      { href: "/hacks", label: "The hacks" },
      { href: "/wallet", label: "Miles and points" },
      { href: "/trips", label: "Saved trips" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#trust", label: "True total cost" },
      { href: "/#faq", label: "Questions" },
      { href: "/login", label: "Log in" },
    ],
  },
];

/** Site footer with a display-only currency switch. */
export function Footer() {
  const { prefs, update } = usePreferences();

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
            <p className="text-xs font-medium tracking-[0.16em] text-ink-muted uppercase">
              {column.title}
            </p>
            <ul className="mt-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col gap-4 border-t border-line py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-muted">
          © {siteConfig.name}. Prices in this preview are sample figures.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SampleNote />
          <div
            className="flex rounded-full border border-line p-1"
            role="group"
            aria-label="Display currency"
          >
            {currencies.map((currency) => (
              <button
                key={currency}
                type="button"
                aria-pressed={prefs.currency === currency}
                onClick={() => update({ currency })}
                className={`min-h-11 rounded-full px-3 text-sm ${
                  prefs.currency === currency
                    ? "bg-ink text-paper"
                    : "text-ink-muted"
                }`}
              >
                {currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$"} {currency}
              </button>
            ))}
          </div>
          <span className="text-xs text-ink-muted">English</span>
        </div>
      </Container>
    </footer>
  );
}
