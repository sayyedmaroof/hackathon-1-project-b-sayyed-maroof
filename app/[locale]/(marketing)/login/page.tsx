import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { redirectIfSignedIn } from "@/lib/auth/navigate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return { title: t("authTitle"), description: t("authLoginBody") };
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  return (
    <Suspense fallback={null}>
      <LoginScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginScreen({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  await redirectIfSignedIn();
  const { reset } = await searchParams;
  const t = await getTranslations("pages");
  return (
    <AuthShell title={t("authTitle")} body={t("authLoginBody")}>
      <AuthForm mode="login" resetDone={reset === "1"} />
    </AuthShell>
  );
}
