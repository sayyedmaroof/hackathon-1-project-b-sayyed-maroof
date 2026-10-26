import { Suspense } from "react";
import { AppHeaderSlot } from "@/components/layout/app-header-slot";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeaderSlot />
      <main className="flex min-h-0 flex-1 flex-col pb-24 md:pb-0">{children}</main>
      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
    </div>
  );
}
