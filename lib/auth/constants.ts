export const MIN_PASSWORD_LENGTH = 10

export const VERIFY_SENT_MESSAGE = 'If this address can be registered, we sent a link'
export const RESEND_MESSAGE = 'If this address can be registered, we sent a link'

export function passwordMeetsMinLength(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH
}
