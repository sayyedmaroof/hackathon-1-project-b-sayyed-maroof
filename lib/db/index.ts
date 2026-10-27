import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return url
}

function createDatabase() {
  return drizzle(neon(getDatabaseUrl()), { schema })
}

export type Db = ReturnType<typeof createDatabase>

let database: Db | undefined

// Public pages can import session helpers without opening a database connection.
export const db = new Proxy({} as Db, {
  get(_target, property) {
    const client = (database ??= createDatabase())
    const value = Reflect.get(client, property, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
