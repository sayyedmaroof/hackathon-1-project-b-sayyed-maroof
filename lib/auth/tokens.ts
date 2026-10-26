import { createHash, randomBytes } from "node:crypto";

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
export const RESET_TTL_MS = 60 * 60 * 1000;

export type TokenRecord = {
  expiresAt: Date;
  usedAt: Date | null;
};

export function createRawToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isTokenUsable(token: TokenRecord, now: Date) {
  if (token.usedAt) return false;
  return token.expiresAt.getTime() > now.getTime();
}
