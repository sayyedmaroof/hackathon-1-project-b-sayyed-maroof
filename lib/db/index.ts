import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let cached: Database | undefined

export function getDb(): Database {
  if (!cached) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    cached = drizzle(neon(url), { schema })
  }
  return cached
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const client = getDb()
    const value = Reflect.get(client as object, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export type Db = Database
