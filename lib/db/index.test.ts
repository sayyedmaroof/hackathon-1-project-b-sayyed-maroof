import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const client = {
    query: {},
    select: vi.fn(function (this: unknown) { return this }),
  }
  return { client, neon: vi.fn(), drizzle: vi.fn(() => client) }
})

vi.mock('@neondatabase/serverless', () => ({ neon: mocks.neon }))
vi.mock('drizzle-orm/neon-http', () => ({ drizzle: mocks.drizzle }))

afterEach(() => vi.unstubAllEnvs())
beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

describe('lazy database initialization', () => {
  it('does not require configuration just to import the module', async () => {
    vi.stubEnv('DATABASE_URL', '')
    const { db } = await import('./index')
    expect(db).toBeDefined()
    expect(mocks.neon).not.toHaveBeenCalled()
  })

  it('fails on use without configuration and retries once configuration is available', async () => {
    vi.stubEnv('DATABASE_URL', '')
    const { db } = await import('./index')
    expect(() => db.select()).toThrow('DATABASE_URL is not set')
    vi.stubEnv('DATABASE_URL', 'postgresql://example.test/database')
    expect(db.select()).toBe(mocks.client)
    expect(mocks.neon).toHaveBeenCalledWith('postgresql://example.test/database')
  })

  it('reuses the client, preserves method binding, and exposes query properties', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://example.test/database')
    const { db } = await import('./index')
    expect(db.select()).toBe(mocks.client)
    expect(db.select()).toBe(mocks.client)
    expect(db.query).toBe(mocks.client.query)
    expect(mocks.drizzle).toHaveBeenCalledTimes(1)
  })
})
