import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

const SCRYPT_N = 16384;
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${SCRYPT_N}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, cost, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || cost !== String(SCRYPT_N) || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const derived = await scryptAsync(password, Buffer.from(salt, "base64url"), expected.length);
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

let dummyHash: Promise<string> | null = null;

/** A real hash so a missing account still pays the scrypt cost. */
export function dummyPasswordHash() {
  dummyHash ??= hashPassword("fareflip-dummy-password");
  return dummyHash;
}
