import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { config } from './config.js'
import type { Database, DocumentListItem, StoredDocument } from './types.js'

const emptyDatabase: Database = {
  documents: [],
}

const ensureFile = async () => {
  await mkdir(path.dirname(config.dataFilePath), { recursive: true })

  try {
    await readFile(config.dataFilePath, 'utf8')
  } catch {
    await writeFile(
      config.dataFilePath,
      JSON.stringify(emptyDatabase, null, 2),
      'utf8'
    )
  }
}

export const readJsonDatabase = async (): Promise<Database> => {
  await ensureFile()
  const file = await readFile(config.dataFilePath, 'utf8')
  return JSON.parse(file) as Database
}

export const writeJsonDatabase = async (database: Database) => {
  await ensureFile()
  await writeFile(config.dataFilePath, JSON.stringify(database, null, 2), 'utf8')
}

export const saveDocumentToJson = async (document: StoredDocument) => {
  const database = await readJsonDatabase()
  database.documents.unshift(document)
  await writeJsonDatabase(database)
  return document
}

export const listJsonDocuments = async (): Promise<DocumentListItem[]> => {
  const database = await readJsonDatabase()
  return database.documents.map((document) => ({
    id: document.id,
    title: document.title,
    source: document.source,
    createdAt: document.createdAt,
    tlDr: document.summary.tlDr,
    actionCount: document.insightReport.actions.length,
  }))
}

export const getJsonDocumentById = async (id: string) => {
  const database = await readJsonDatabase()
  return database.documents.find((document) => document.id === id) || null
}

export const getAllJsonDocuments = async () => {
  const database = await readJsonDatabase()
  return database.documents
}
