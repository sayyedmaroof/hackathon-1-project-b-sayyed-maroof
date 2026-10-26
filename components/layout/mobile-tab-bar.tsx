"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Luggage, Ticket, Wallet } from "lucide-react";
import { cn } from "cn";

const tabs = [
  { href: "/plan", label: "Plan", icon: Compass },
  { href: "/results", label: "Results", icon: Ticket },
  { href: "/trips", label: "Trips", icon: Luggage },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

/** Phone navigation. Sits above the home indicator. */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-md md:hidden"
      aria-label="Product"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px]",
                  active ? "text-accent" : "text-ink-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" aria-hidden="true" />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
