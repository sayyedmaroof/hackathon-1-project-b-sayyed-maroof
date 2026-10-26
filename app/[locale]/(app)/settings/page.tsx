import { Container } from "@/components/layout/container";
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <Container className="py-8">
      <SettingsForm />
    </Container>
  );
}
