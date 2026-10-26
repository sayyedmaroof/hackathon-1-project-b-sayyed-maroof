"use server";

import { eq } from "drizzle-orm";
import { normalizeEmail, validEmail, validName, validPassword } from "@/lib/auth/fields";
import { requestLocale } from "@/lib/auth/locale";
import type { AuthFormState, ProfileFormState } from "@/lib/auth/form-state";
import { redirectTo } from "@/lib/auth/navigate";
import { dummyPasswordHash, hashPassword, verifyPassword } from "@/lib/auth/password";
import { forgotPasswordResult } from "@/lib/auth/reset";
import { consumeAuthToken, createSession, destroySession, issueAuthToken, requireUser, revokeUserSessions } from "@/lib/auth/session";
import { updateOwnProfile } from "@/lib/data/profile";
import { getDb } from "@/lib/db/client";
import { profiles, users } from "@/lib/db/schema";
import { authLink, sendResetEmail, sendVerificationEmail } from "@/lib/mail/brevo";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function isUniqueViolation(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string; cause?: { code?: string } };
  return record.code === "23505" || record.cause?.code === "23505" || (record.message?.includes("duplicate key") ?? false);
}

async function sendVerifyLink(userId: string, email: string) {
  const locale = await requestLocale();
  const token = await issueAuthToken(userId, "verify_email");
  await sendVerificationEmail(email, authLink("/verify-email", token, locale));
}

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = text(formData, "name");
  const email = normalizeEmail(text(formData, "email"));
  const password = text(formData, "password");
  if (!validName(name)) return { ok: false, error: "bad_name" };
  if (!validEmail(email)) return { ok: false, error: "bad_email" };
  if (!validPassword(password)) return { ok: false, error: "weak_password" };

  const passwordHash = await hashPassword(password);

  try {
    const db = getDb();
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing[0]?.emailVerifiedAt) return { ok: false, error: "email_taken" };

    let userId = existing[0]?.id;
    if (userId) {
      await db.update(users).set({ name: name.trim(), passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
    } else {
      const inserted = await db.insert(users).values({ email, name: name.trim(), passwordHash }).returning({ id: users.id });
      userId = inserted[0]?.id;
      if (!userId) return { ok: false, error: "email_failed" };
    }
    await db.insert(profiles).values({ userId, language: "en", homeAirport: "MAD" }).onConflictDoNothing();
    await sendVerifyLink(userId, email);
    return { ok: true, status: "check_email" };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "email_taken" };
    console.error(error);
    return { ok: false, error: "email_failed" };
  }
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(text(formData, "email"));
  const password = text(formData, "password");
  if (!validEmail(email) || !validPassword(password)) return { ok: false, error: "invalid" };

  const rows = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  const passwordOk = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, await dummyPasswordHash());
  if (!user || !passwordOk) return { ok: false, error: "invalid" };
  if (!user.emailVerifiedAt) {
    try {
      await sendVerifyLink(user.id, user.email);
    } catch (error) {
      console.error(error);
      return { ok: false, error: "email_failed" };
    }
    return { ok: false, error: "unverified" };
  }

  await createSession(user.id);
  return redirectTo("/chat");
}

export async function logout() {
  await destroySession();
  await redirectTo("/login");
}

export async function forgotPassword(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(text(formData, "email"));
  if (!validEmail(email)) return { ok: false, error: "bad_email" };

  const rows = await getDb().select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (user) {
    try {
      const locale = await requestLocale();
      const token = await issueAuthToken(user.id, "reset_password");
      await sendResetEmail(user.email, authLink("/reset-password", token, locale));
    } catch (error) {
      console.error(error);
    }
  }

  return { ...forgotPasswordResult(Boolean(user)), status: "reset_sent" };
}

export async function resetPassword(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const token = text(formData, "token");
  const password = text(formData, "password");
  if (!token) return { ok: false, error: "expired" };
  if (!validPassword(password)) return { ok: false, error: "weak_password" };

  const userId = await consumeAuthToken(token, "reset_password");
  if (!userId) return { ok: false, error: "expired" };

  await getDb().update(users).set({ passwordHash: await hashPassword(password), updatedAt: new Date() }).where(eq(users.id, userId));
  await revokeUserSessions(userId);
  return redirectTo("/login?reset=1");
}

export async function verifyEmail(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const token = text(formData, "token");
  if (!token) return { ok: false, error: "expired" };
  const userId = await consumeAuthToken(token, "verify_email");
  if (!userId) return { ok: false, error: "expired" };

  await getDb().update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
  await createSession(userId);
  return redirectTo("/chat");
}

export async function currentUser() {
  const user = await requireUser();
  if (!user) return null;
  return { name: user.name };
}

export async function updateProfile(_state: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  return updateOwnProfile({
    name: text(formData, "name"),
    language: text(formData, "language"),
    homeAirport: text(formData, "homeAirport"),
  });
}
