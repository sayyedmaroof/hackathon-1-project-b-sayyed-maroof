"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

/** Theme, toasts, and tooltip delay. Command palette mounts beside these. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delay={200}>
        {children}
        <Toaster position="top-center" closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}
