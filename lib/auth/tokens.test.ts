import { describe, expect, it } from "vitest";
import { isTokenUsable } from "@/lib/auth/tokens";

const now = new Date("2026-10-26T12:00:00.000Z");

describe("auth tokens", () => {
  it("accepts a token that has not been used and has not expired", () => {
    expect(isTokenUsable({ expiresAt: new Date("2026-10-26T12:00:01.000Z"), usedAt: null }, now)).toBe(true);
  });

  it("rejects an expired token and a token that was already used", () => {
    expect(isTokenUsable({ expiresAt: now, usedAt: null }, now)).toBe(false);
    expect(isTokenUsable({ expiresAt: new Date("2026-10-27T12:00:00.000Z"), usedAt: now }, now)).toBe(false);
  });
});
