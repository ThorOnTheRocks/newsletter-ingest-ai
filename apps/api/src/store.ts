import {
  getAllJsonDocuments,
  getJsonDocumentById,
  listJsonDocuments,
  saveDocumentToJson,
} from './json-store.js'
import {
  getAllPostgresDocuments,
  getPostgresDocumentById,
  listPostgresDocuments,
  saveDocumentToPostgres,
} from './postgres-store.js'
import { config } from './config.js'
import type { DocumentListItem, StoredDocument } from './types.js'

export const saveDocument = async (document: StoredDocument) => {
  if (config.storageBackend === 'postgres') {
    return saveDocumentToPostgres(document)
  }

  return saveDocumentToJson(document)
}

export const listDocuments = async (): Promise<DocumentListItem[]> => {
  if (config.storageBackend === 'postgres') {
    return listPostgresDocuments()
  }

  return listJsonDocuments()
}

export const getDocumentById = async (id: string) => {
  if (config.storageBackend === 'postgres') {
    return getPostgresDocumentById(id)
  }

  return getJsonDocumentById(id)
}

export const getAllDocuments = async () => {
  if (config.storageBackend === 'postgres') {
    return getAllPostgresDocuments()
  }

  return getAllJsonDocuments()
}
