import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { SettingsForm } from "@/components/settings/settings-form";
import { getOwnProfile } from "@/lib/data/profile";

export default function SettingsPage() {
  return (
    <Container className="py-8">
      <Suspense fallback={<div className="h-40" />}>
        <SettingsPanel />
      </Suspense>
    </Container>
  );
}

async function SettingsPanel() {
  const profile = await getOwnProfile();
  return <SettingsForm profile={profile} />;
}
