import { describe, expect, it } from "vitest";
import { forgotPasswordResult } from "@/lib/auth/reset";

describe("password reset response", () => {
  it("gives the same public result when the email is missing", () => {
    expect(forgotPasswordResult(true)).toEqual(forgotPasswordResult(false));
    expect(forgotPasswordResult(false)).toEqual({ ok: true });
  });
});
