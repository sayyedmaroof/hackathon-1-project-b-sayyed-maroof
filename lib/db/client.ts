import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema";

type Database = NeonHttpDatabase<typeof schema>;

let database: Database | null = null;

export function getDb() {
  if (database) return database;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Neon hosts use the HTTP driver. Any other Postgres URL, including a local one, uses node-postgres.
  if (/neon\.tech/i.test(url)) {
    database = drizzleNeon(neon(url), { schema });
    return database;
  }
  database = drizzleNode(new Pool({ connectionString: url }), { schema }) as unknown as Database;
  return database;
}
