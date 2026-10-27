import { describe, expect, it } from 'vitest'
import { safeNextPath } from './next-path'

describe('safeNextPath', () => {
  it('rejects protocol-relative and control-character openers', () => {
    expect(safeNextPath('/\\evil.com')).toBe('/')
    expect(safeNextPath('/\t/evil.com')).toBe('/')
    expect(safeNextPath('/%2F%2Fevil.com')).toBe('/')
    expect(safeNextPath('https://evil.com')).toBe('/')
  })

  it('allows an internal plan path', () => {
    expect(safeNextPath('/plan')).toBe('/plan')
  })
})
