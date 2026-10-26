import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("passwords", () => {
  it("accepts the original password and rejects a different one", async () => {
    const stored = await hashPassword("correct-horse");
    expect(await verifyPassword("correct-horse", stored)).toBe(true);
    expect(await verifyPassword("wrong-horse", stored)).toBe(false);
    expect(await verifyPassword("correct-horse", "not-a-hash")).toBe(false);
  });
});
