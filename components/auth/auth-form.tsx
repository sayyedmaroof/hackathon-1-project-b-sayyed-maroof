"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { login, signup } from "@/lib/auth/actions";
import type { AuthErrorCode, AuthFormState } from "@/lib/auth/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

type AuthFormProps = {
  mode: "login" | "signup";
  resetDone?: boolean;
};

function messageKey(error: AuthErrorCode) {
  switch (error) {
    case "invalid":
      return "authInvalid";
    case "email_taken":
      return "authEmailTaken";
    case "unverified":
      return "authUnverified";
    case "weak_password":
      return "authPasswordShort";
    case "bad_email":
      return "authBadEmail";
    case "bad_name":
      return "authNameShort";
    case "expired":
      return "authVerifyInvalid";
    case "email_failed":
      return "authEmailFailed";
  }
}

export function AuthForm({ mode, resetDone = false }: AuthFormProps) {
  const t = useTranslations("pages");
  const common = useTranslations("common");
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, null as AuthFormState);

  if (state?.ok) {
    return <p className="text-sm">{t("authCheckEmail")}</p>;
  }

  return (
    <form action={formAction}>
      {resetDone ? <p className="mb-4 text-sm">{t("authResetDone")}</p> : null}
      {state && !state.ok ? <p className="mb-4 text-sm text-risk">{t(messageKey(state.error))}</p> : null}
      {mode === "signup" ? (
        <label className="mb-3 block text-sm" htmlFor="name">
          {common("name")}
          <Input className="mt-1" id="name" name="name" autoComplete="name" required minLength={2} />
        </label>
      ) : null}
      <label className="mb-3 block text-sm" htmlFor="email">
        {common("email")}
        <Input className="mt-1" id="email" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="mb-4 block text-sm" htmlFor="password">
        {common("password")}
        <Input
          className="mt-1"
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
        />
      </label>
      {mode === "login" ? (
        <p className="mb-4 text-sm">
          <Link href="/forgot-password" className="underline">
            {t("authForgot")}
          </Link>
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? common("loading") : mode === "login" ? common("login") : common("signup")}
      </Button>
      <p className="mt-4 text-sm text-ink-muted">
        {mode === "login" ? (
          <Link href="/signup" className="underline">
            {common("signup")}
          </Link>
        ) : (
          <Link href="/login" className="underline">
            {common("login")}
          </Link>
        )}
      </p>
    </form>
  );
}
