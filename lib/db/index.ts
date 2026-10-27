import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return url
}

export const db = drizzle(neon(getDatabaseUrl()), { schema })

export type Db = typeof db
