import { closeDb, verifyDatabaseCapabilities } from '../db/client.js'
import { config } from '../config.js'
import { readJsonDatabase } from '../json-store.js'
import { upsertPostgresDocument } from '../postgres-store.js'

const run = async () => {
  if (config.storageBackend !== 'postgres') {
    throw new Error(
      'Set STORAGE_BACKEND=postgres before running the import script.'
    )
  }

  await verifyDatabaseCapabilities()
  const database = await readJsonDatabase()

  for (const document of database.documents) {
    await upsertPostgresDocument(document)
  }

  console.log(`Imported ${database.documents.length} documents into Postgres.`)
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDb()
  })
