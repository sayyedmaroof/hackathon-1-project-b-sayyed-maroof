import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return { title: t("authResetTitle"), description: t("authResetBody") };
}

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  return (
    <Suspense fallback={null}>
      <ResetScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetScreen({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const t = await getTranslations("pages");
  return (
    <AuthShell title={t("authResetTitle")} body={t("authResetBody")}>
      <ResetForm token={token ?? ""} />
    </AuthShell>
  );
}
