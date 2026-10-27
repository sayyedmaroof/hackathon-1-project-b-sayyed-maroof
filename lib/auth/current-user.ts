import { getSessionUser } from './session'
import type { SessionUser } from './types'

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSessionUser()
}

export type { SessionUser }
