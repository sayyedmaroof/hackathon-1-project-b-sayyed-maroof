import { afterEach, describe, expect, it, vi } from 'vitest'

describe('lazy db client', () => {
  afterEach(() => {
    vi.resetModules()
  })

  it('can be imported without DATABASE_URL', async () => {
    const prev = process.env.DATABASE_URL
    delete process.env.DATABASE_URL
    vi.resetModules()
    const mod = await import('./index')
    expect(mod.db).toBeTruthy()
    expect(() => mod.db.select).toThrow(/DATABASE_URL/)
    if (prev) process.env.DATABASE_URL = prev
  })
})
