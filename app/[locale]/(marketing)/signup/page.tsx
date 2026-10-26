import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { redirectIfSignedIn } from "@/lib/auth/navigate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return { title: t("authSignupTitle"), description: t("authSignupBody") };
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupScreen />
    </Suspense>
  );
}

async function SignupScreen() {
  await redirectIfSignedIn();
  const t = await getTranslations("pages");
  return (
    <AuthShell title={t("authSignupTitle")} body={t("authSignupBody")}>
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
