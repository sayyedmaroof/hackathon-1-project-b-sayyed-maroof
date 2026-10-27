export const MIN_PASSWORD_LENGTH = 10

export function passwordMeetsMinLength(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH
}
