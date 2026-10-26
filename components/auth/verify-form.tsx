"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { verifyEmail } from "@/lib/auth/actions";
import type { AuthFormState } from "@/lib/auth/form-state";
import { Button } from "@/components/ui/button";

export function VerifyForm({ token }: { token: string }) {
  const t = useTranslations("pages");
  const common = useTranslations("common");
  const [state, action, pending] = useActionState(verifyEmail, null as AuthFormState);

  if (!token || (state && !state.ok)) {
    return <p className="text-sm text-risk">{t("authVerifyInvalid")}</p>;
  }

  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? common("loading") : t("authVerifyAction")}
      </Button>
    </form>
  );
}
