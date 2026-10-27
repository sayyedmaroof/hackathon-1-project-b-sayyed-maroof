import { describe, expect, it } from 'vitest'
import { passwordMeetsMinLength } from './constants'
import { hashPassword, verifyPassword } from './password'

describe('password', () => {
  it('requires minimum length', () => {
    expect(passwordMeetsMinLength('short')).toBe(false)
    expect(passwordMeetsMinLength('longenough1')).toBe(true)
  })

  it('hashes and verifies with scrypt', async () => {
    const hash = await hashPassword('longenough1')
    expect(hash.includes(':')).toBe(true)
    expect(await verifyPassword('longenough1', hash)).toBe(true)
    expect(await verifyPassword('wrongpassword', hash)).toBe(false)
  })
})
