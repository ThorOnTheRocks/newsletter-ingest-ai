import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import { Pool } from 'pg'
import { config } from '../config.js'
import * as schema from './schema.js'

let pool: Pool | null = null

export const getDb = () => {
  if (!config.databaseUrl) {
    throw new Error(
      'Missing DATABASE_URL. Add it to apps/api/.env when using STORAGE_BACKEND=postgres.'
    )
  }

  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
    })
  }

  return drizzle(pool, { schema })
}

export const closeDb = async () => {
  if (pool) {
    await pool.end()
    pool = null
  }
}

export const verifyDatabaseCapabilities = async () => {
  const db = getDb()
  const extensionResult = await db.execute(
    sql`select exists(select 1 from pg_extension where extname = 'vector') as installed`
  )
  const installed = Boolean(extensionResult.rows[0]?.installed)

  if (!installed) {
    throw new Error(
      'The Postgres database does not have the pgvector extension enabled. Enable pgvector in Supabase before using STORAGE_BACKEND=postgres.'
    )
  }
}
