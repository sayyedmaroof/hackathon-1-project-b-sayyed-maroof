"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useRouter } from "@/i18n/navigation";
import { useFareStore } from "@/hooks/use-fare-store";
import { siteConfig } from "@/lib/site-config";

type CommandContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommandPalette() {
  const value = useContext(CommandContext);
  if (!value) throw new Error("useCommandPalette must be used inside CommandPaletteProvider");
  return value;
}

/** Command menu, mounted once inside the locale provider. */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const fare = useFareStore();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const pages = [
    { href: "/chat", label: common("newChat") },
    { href: "/trips", label: t("goBoard") },
    { href: "/earn", label: t("goEarn") },
    { href: "/wallet", label: common("wallet") },
    { href: "/pricing", label: common("pricing") },
    { href: "/hacks", label: common("learn") },
    { href: "/settings", label: common("settings") },
    { href: "/login", label: common("login") },
  ];

  return (
    <CommandContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen} title={t("commandTitle")} description={t("commandHint")}>
        <CommandInput placeholder={t("commandHint")} />
        <CommandList>
          <CommandEmpty>—</CommandEmpty>
          <CommandGroup heading={siteConfig.name}>
            {pages.map((page) => (
              <CommandItem key={page.href} onSelect={() => go(page.href)}>
                {page.label}
              </CommandItem>
            ))}
            <CommandItem
              onSelect={() => {
                fare.setMode(fare.store.mode === "plan" ? "now" : "plan");
                setOpen(false);
              }}
            >
              {t("switchMode")}
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("toggleTheme")}>
            <CommandItem
              onSelect={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
                setOpen(false);
              }}
            >
              {t("toggleTheme")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandContext.Provider>
  );
}
