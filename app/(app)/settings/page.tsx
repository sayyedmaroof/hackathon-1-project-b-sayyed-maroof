import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Home airport, currency, and how much an hour is worth to you.",
};

export default function SettingsPage() {
  return (
    <Container className="py-8 md:py-12">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">Settings</p>
      <h1 className="mt-2 font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] tracking-[-0.04em]">
        Your defaults.
      </h1>
      <div className="mt-8">
        <SettingsForm />
      </div>
    </Container>
  );
}
