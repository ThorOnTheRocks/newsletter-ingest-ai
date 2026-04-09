import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)

export const config = {
  port: Number(process.env.PORT || 4000),
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  storageBackend:
    process.env.STORAGE_BACKEND === 'postgres' ? 'postgres' : 'json',
  databaseUrl: process.env.DATABASE_URL || '',
  databaseSsl: process.env.DATABASE_SSL === 'true',
  dataFilePath: path.resolve(currentDir, '../data/documents.json'),
}

export const assertConfig = () => {
  if (!config.openAiApiKey) {
    throw new Error(
      'Missing OPENAI_API_KEY. Add it to apps/api/.env before starting the API.'
    )
  }
}

export const logModelConfiguration = () => {
  console.log(`Chat model: ${config.openAiModel}`)
  console.log(`Embedding model: ${config.embeddingModel}`)
  console.log(`Storage backend: ${config.storageBackend}`)
}
