import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyForm } from "@/components/auth/verify-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return { title: t("authVerifyTitle"), description: t("authVerifyBody") };
}

export default function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  return (
    <Suspense fallback={null}>
      <VerifyScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifyScreen({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const t = await getTranslations("pages");
  return (
    <AuthShell title={t("authVerifyTitle")} body={t("authVerifyBody")}>
      <VerifyForm token={token ?? ""} />
    </AuthShell>
  );
}
