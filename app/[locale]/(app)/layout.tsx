import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<div className="h-14 border-b border-line" />}>
        <AppHeader />
      </Suspense>
      <main className="flex min-h-0 flex-1 flex-col pb-24 md:pb-0">{children}</main>
      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
    </div>
  );
}
