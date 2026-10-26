export type ProfilePatch = {
  name: string;
  language: "en" | "es";
  homeAirport: string;
};

export type ProfileWriter = {
  update(userId: string, patch: ProfilePatch): Promise<void>;
};

export async function writeOwnedProfile(
  writer: ProfileWriter,
  actorId: string,
  targetUserId: string,
  patch: ProfilePatch,
): Promise<{ ok: true } | { ok: false; error: "not_found" }> {
  if (actorId !== targetUserId) return { ok: false, error: "not_found" };
  await writer.update(actorId, patch);
  return { ok: true };
}
