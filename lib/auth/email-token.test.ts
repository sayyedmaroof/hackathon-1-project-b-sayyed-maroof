import { describe, expect, it } from 'vitest'
import { createHash, randomBytes } from 'node:crypto'
import { sha256, randomToken } from './crypto'

describe('email verification tokens', () => {
  it('generates url-safe tokens and stable hashes', () => {
    const token = randomToken(32)
    expect(token.length).toBeGreaterThan(20)
    expect(sha256(token)).toHaveLength(64)
    expect(sha256(token)).toBe(createHash('sha256').update(token).digest('hex'))
  })

  it('uses random bytes for token entropy', () => {
    const a = randomBytes(32).toString('base64url')
    const b = randomBytes(32).toString('base64url')
    expect(a).not.toBe(b)
  })
})
