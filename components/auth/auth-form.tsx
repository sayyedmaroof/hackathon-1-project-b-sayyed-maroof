"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";

type AuthFormProps = {
  mode: "login" | "signup";
};

/** Visual auth only. A successful form does not create an account. */
export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("pages");
  const common = useTranslations("common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    if (mode === "signup" && name.trim().length < 2) next.name = t("authBody");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t("authBody");
    if (password.length < 8) next.password = t("authBody");
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    toast(t("authToast"));
    router.push("/chat");
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <Logo />
      <h1 className="mt-8 font-display text-4xl tracking-tight">{t("authTitle")}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t("authBody")}</p>
      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {mode === "signup" ? (
          <label className="mb-3 block text-sm">
            {t("authTitle")}
            <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.name)} />
            {errors.name ? <span className="mt-1 block text-xs text-risk">{errors.name}</span> : null}
          </label>
        ) : null}
        <label className="mb-3 block text-sm">
          Email
          <Input className="mt-1" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} />
          {errors.email ? <span className="mt-1 block text-xs text-risk">{errors.email}</span> : null}
        </label>
        <label className="mb-4 block text-sm">
          Password
          <Input
            className="mt-1"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? <span className="mt-1 block text-xs text-risk">{errors.password}</span> : null}
        </label>
        <Button type="submit" className="w-full">
          {mode === "login" ? common("login") : common("signup")}
        </Button>
        <p className="mt-4 text-sm text-ink-muted">
          {mode === "login" ? (
            <Link href="/signup" className="underline">{common("signup")}</Link>
          ) : (
            <Link href="/login" className="underline">{common("login")}</Link>
          )}
        </p>
      </form>
    </div>
  );
}
