import type { AppLocale } from "@/i18n/routing";

export type AuthErrorCode =
  | "invalid"
  | "email_taken"
  | "unverified"
  | "weak_password"
  | "bad_email"
  | "bad_name"
  | "expired"
  | "email_failed";

export type AuthFormState = { ok: true; status: "check_email" | "reset_sent" } | { ok: false; error: AuthErrorCode } | null;

export type ProfileErrorCode = "unauthenticated" | "bad_name" | "airport" | "language" | "not_found";

export type ProfileFormState = { ok: true; language: AppLocale } | { ok: false; error: ProfileErrorCode } | null;
