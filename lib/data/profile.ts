import "server-only";

import { eq } from "drizzle-orm";
import { parseHomeAirport, parseLanguage, validName } from "@/lib/auth/fields";
import { requireUser } from "@/lib/auth/session";
import { writeOwnedProfile, type ProfilePatch, type ProfileWriter } from "@/lib/data/ownership";
import { getDb } from "@/lib/db/client";
import { profiles, users } from "@/lib/db/schema";
import type { AppLocale } from "@/i18n/routing";
import type { ProfileFormState } from "@/lib/auth/form-state";

export type ProfileDTO = {
  name: string;
  email: string;
  language: AppLocale;
  homeAirport: string;
};

const writer: ProfileWriter = {
  async update(userId, patch) {
    const db = getDb();
    await db.update(users).set({ name: patch.name, updatedAt: new Date() }).where(eq(users.id, userId));
    await db
      .update(profiles)
      .set({ language: patch.language, homeAirport: patch.homeAirport })
      .where(eq(profiles.userId, userId));
  },
};

export async function getOwnProfile(): Promise<ProfileDTO | null> {
  const user = await requireUser();
  if (!user) return null;

  const rows = await getDb()
    .select({
      name: users.name,
      email: users.email,
      language: profiles.language,
      homeAirport: profiles.homeAirport,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return row;
}

export async function updateOwnProfile(input: { name: string; language: string; homeAirport: string }): Promise<ProfileFormState> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "unauthenticated" };
  if (!validName(input.name)) return { ok: false, error: "bad_name" };
  const language = parseLanguage(input.language);
  if (!language) return { ok: false, error: "language" };
  const homeAirport = parseHomeAirport(input.homeAirport);
  if (!homeAirport) return { ok: false, error: "airport" };

  const patch: ProfilePatch = { name: input.name.trim(), language, homeAirport };
  const written = await writeOwnedProfile(writer, user.id, user.id, patch);
  if (!written.ok) return { ok: false, error: "not_found" };
  return { ok: true, language };
}
