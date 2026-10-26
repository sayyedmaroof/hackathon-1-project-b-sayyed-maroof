"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
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
import { resultsHref } from "@/lib/query";
import { siteConfig } from "@/lib/site-config";

type CommandContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommandPalette() {
  const value = useContext(CommandContext);
  if (!value) {
    throw new Error("useCommandPalette must be used inside CommandPaletteProvider");
  }
  return value;
}

const pages = [
  { href: "/", label: "Home" },
  { href: "/plan", label: "Plan a trip" },
  { href: "/results", label: "Latest results" },
  { href: "/trips", label: "Saved trips" },
  { href: "/wallet", label: "Miles and points" },
  { href: "/hacks", label: "Hack guides" },
  { href: "/settings", label: "Settings" },
  { href: "/login", label: "Log in" },
];

/** ⌘K / Ctrl+K jump menu, mounted once for the whole app. */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

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

  return (
    <CommandContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={`${siteConfig.name} command menu`}
        description="Jump to a page, start a search, or switch theme."
      >
        <CommandInput placeholder="Jump, search, or switch theme…" />
        <CommandList>
          <CommandEmpty>Nothing matches that.</CommandEmpty>
          <CommandGroup heading="Go">
            {pages.map((page) => (
              <CommandItem key={page.href} onSelect={() => go(page.href)}>
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Search">
            <CommandItem
              onSelect={() =>
                go(
                  resultsHref({
                    mode: "quick",
                    travellers: 1,
                    cabin: "economy",
                    flexDays: 3,
                    legs: [
                      {
                        id: "leg-1",
                        from: "MAD",
                        to: "LIS",
                        depart: "2026-11-12",
                        returnDate: "2026-11-16",
                      },
                    ],
                  }),
                )
              }
            >
              Madrid to Lisbon, mid November
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
                setOpen(false);
              }}
            >
              Toggle theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandContext.Provider>
  );
}
