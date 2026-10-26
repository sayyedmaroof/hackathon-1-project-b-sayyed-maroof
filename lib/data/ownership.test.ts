import { describe, expect, it } from "vitest";
import { writeOwnedProfile, type ProfilePatch } from "@/lib/data/ownership";

const patch: ProfilePatch = { name: "Marta", language: "es", homeAirport: "MAD" };

describe("profile ownership", () => {
  it("does not write when the actor is not the row owner", async () => {
    const writes: string[] = [];
    const result = await writeOwnedProfile(
      {
        update: async (userId) => {
          writes.push(userId);
        },
      },
      "actor",
      "someone-else",
      patch,
    );
    expect(result).toEqual({ ok: false, error: "not_found" });
    expect(writes).toEqual([]);
  });

  it("writes only the actor id", async () => {
    const writes: string[] = [];
    const result = await writeOwnedProfile(
      {
        update: async (userId) => {
          writes.push(userId);
        },
      },
      "actor",
      "actor",
      patch,
    );
    expect(result).toEqual({ ok: true });
    expect(writes).toEqual(["actor"]);
  });
});
