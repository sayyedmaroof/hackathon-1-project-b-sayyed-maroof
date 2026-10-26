"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { resetPassword } from "@/lib/auth/actions";
import type { AuthFormState } from "@/lib/auth/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

export function ResetForm({ token }: { token: string }) {
  const t = useTranslations("pages");
  const common = useTranslations("common");
  const [state, action, pending] = useActionState(resetPassword, null as AuthFormState);

  if (!token) return <p className="text-sm text-risk">{t("authResetInvalid")}</p>;

  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      {state && !state.ok ? (
        <p className="mb-4 text-sm text-risk">{state.error === "weak_password" ? t("authPasswordShort") : t("authResetInvalid")}</p>
      ) : null}
      <label className="mb-4 block text-sm" htmlFor="password">
        {common("password")}
        <Input className="mt-1" id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? common("loading") : t("authResetTitle")}
      </Button>
      <p className="mt-4 text-sm text-ink-muted">
        <Link href="/login" className="underline">
          {common("login")}
        </Link>
      </p>
    </form>
  );
}
