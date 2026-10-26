import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { authTokens, sessions, users } from "@/lib/db/schema";
import { createRawToken, hashToken, isTokenUsable, RESET_TTL_MS, VERIFY_TTL_MS } from "@/lib/auth/tokens";

export const SESSION_COOKIE = "ff_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export const getSession = cache(async (): Promise<{ user: SessionUser } | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await getDb()
    .select({
      expiresAt: sessions.expiresAt,
      userId: users.id,
      email: users.email,
      name: users.name,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.tokenHash, hashToken(token)))
    .limit(1);

  const row = rows[0];
  if (!row || !row.emailVerifiedAt || !isTokenUsable({ expiresAt: row.expiresAt, usedAt: null }, new Date())) {
    return null;
  }

  return { user: { id: row.userId, email: row.email, name: row.name } };
});

export async function requireUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function createSession(userId: string) {
  const token = createRawToken();
  await getDb()
    .insert(sessions)
    .values({
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions());
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

export async function revokeUserSessions(userId: string) {
  await getDb().delete(sessions).where(eq(sessions.userId, userId));
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

export async function issueAuthToken(userId: string, kind: "verify_email" | "reset_password") {
  const token = createRawToken();
  const db = getDb();
  await db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.kind, kind), isNull(authTokens.usedAt)));
  await db.insert(authTokens).values({
    userId,
    kind,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + (kind === "verify_email" ? VERIFY_TTL_MS : RESET_TTL_MS)),
  });
  return token;
}

export async function consumeAuthToken(raw: string, kind: "verify_email" | "reset_password") {
  const db = getDb();
  const rows = await db.select().from(authTokens).where(eq(authTokens.tokenHash, hashToken(raw))).limit(1);
  const token = rows[0];
  if (!token || token.kind !== kind || !isTokenUsable(token, new Date())) return null;

  const consumed = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(authTokens.id, token.id), isNull(authTokens.usedAt)))
    .returning({ userId: authTokens.userId });

  return consumed[0]?.userId ?? null;
}
