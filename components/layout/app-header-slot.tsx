import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { getSession } from "@/lib/auth/session";

async function HeaderWithSession() {
  const session = await getSession();
  return <AppHeader user={session ? { name: session.user.name } : null} />;
}

export function AppHeaderSlot() {
  return (
    <Suspense fallback={<div className="h-14 border-b border-line" />}>
      <HeaderWithSession />
    </Suspense>
  );
}
