import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotForm } from "@/components/auth/forgot-form";
import { AuthShell } from "@/components/auth/auth-shell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return { title: t("authForgotTitle"), description: t("authForgotBody") };
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotScreen />
    </Suspense>
  );
}

async function ForgotScreen() {
  const t = await getTranslations("pages");
  return (
    <AuthShell title={t("authForgotTitle")} body={t("authForgotBody")}>
      <ForgotForm />
    </AuthShell>
  );
}
