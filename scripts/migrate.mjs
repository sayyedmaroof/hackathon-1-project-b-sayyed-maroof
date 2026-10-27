import { resolve } from 'node:path'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'
import { getUnpooledDatabaseUrl, loadEnvFiles } from './load-env.mjs'

loadEnvFiles()

const db = drizzle(neon(getUnpooledDatabaseUrl()))
await migrate(db, { migrationsFolder: resolve(process.cwd(), 'lib/db/migrations') })
console.log('Migrations applied successfully.')
