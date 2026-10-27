import { neon } from '@neondatabase/serverless'
import { getUnpooledDatabaseUrl, loadEnvFiles } from './load-env.mjs'

loadEnvFiles()
const sql = neon(getUnpooledDatabaseUrl())

await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`
await sql`DROP TABLE IF EXISTS bookings CASCADE`
await sql`DROP TABLE IF EXISTS email_tokens CASCADE`
await sql`DROP TABLE IF EXISTS searches CASCADE`
await sql`DROP TABLE IF EXISTS sessions CASCADE`
await sql`DROP TABLE IF EXISTS users CASCADE`
await sql`DROP TYPE IF EXISTS booking_provider CASCADE`

console.log('Remote database cleaned (app tables + drizzle migration history).')
