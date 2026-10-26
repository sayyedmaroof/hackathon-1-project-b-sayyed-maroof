"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { forgotPassword } from "@/lib/auth/actions";
import type { AuthFormState } from "@/lib/auth/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

export function ForgotForm() {
  const t = useTranslations("pages");
  const common = useTranslations("common");
  const [state, action, pending] = useActionState(forgotPassword, null as AuthFormState);

  if (state?.ok) return <p className="text-sm">{t("authForgotSent")}</p>;

  return (
    <form action={action}>
      {state && !state.ok ? (
        <p className="mb-4 text-sm text-risk">{state.error === "bad_email" ? t("authBadEmail") : t("authEmailFailed")}</p>
      ) : null}
      <label className="mb-4 block text-sm" htmlFor="email">
        {common("email")}
        <Input className="mt-1" id="email" name="email" type="email" autoComplete="email" required />
      </label>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? common("loading") : t("authForgot")}
      </Button>
      <p className="mt-4 text-sm text-ink-muted">
        <Link href="/login" className="underline">
          {common("login")}
        </Link>
      </p>
    </form>
  );
}
