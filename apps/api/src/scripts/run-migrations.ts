import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sql } from 'drizzle-orm'
import { closeDb, getDb } from '../db/client.js'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const migrationsDir = path.resolve(currentDir, '../../drizzle')

const run = async () => {
  const db = getDb()
  const entries = await readdir(migrationsDir)
  const sqlFiles = entries.filter((entry) => entry.endsWith('.sql')).sort()

  for (const fileName of sqlFiles) {
    const filePath = path.join(migrationsDir, fileName)
    const statements = await readFile(filePath, 'utf8')
    await db.execute(sql.raw(statements))
    console.log(`Applied migration ${fileName}`)
  }
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDb()
  })
