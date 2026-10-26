"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Compass, Luggage, MessagesSquare, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Phone navigation. Sits above the home indicator. */
export function MobileTabBar() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const tabs = [
    { href: "/chat", label: t("chat"), icon: MessagesSquare },
    { href: "/trips", label: t("trips"), icon: Luggage },
    { href: "/earn", label: t("earn"), icon: Compass },
    { href: "/wallet", label: t("wallet"), icon: Wallet },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-md md:hidden"
      aria-label="Product"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = pathname.includes(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px]",
                  active ? "text-accent" : "text-ink-muted",
                )}
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
