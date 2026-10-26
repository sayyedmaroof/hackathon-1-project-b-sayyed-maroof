import { AppHeader } from "@/components/layout/app-header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-24 md:pb-10">{children}</main>
      <MobileTabBar />
    </>
  );
}
