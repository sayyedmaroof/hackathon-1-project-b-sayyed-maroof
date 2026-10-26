/** The public forgot-password result never says whether the email exists. */
export function forgotPasswordResult(emailFound: boolean): { ok: true } {
  void emailFound;
  return { ok: true };
}
