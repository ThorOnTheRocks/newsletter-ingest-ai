import { asc, desc, eq, inArray } from 'drizzle-orm'
import { getDb } from './db/client.js'
import {
  documentChunks,
  documents,
  documentSummaries,
} from './db/schema.js'
import type { DocumentListItem, StoredDocument } from './types.js'

const mapRowsToStoredDocuments = ({
  documentRows,
  summaryRows,
  chunkRows,
}: {
  documentRows: Array<typeof documents.$inferSelect>
  summaryRows: Array<typeof documentSummaries.$inferSelect>
  chunkRows: Array<typeof documentChunks.$inferSelect>
}): StoredDocument[] => {
  const summaryMap = new Map(summaryRows.map((row) => [row.documentId, row]))
  const chunksByDocumentId = new Map<string, Array<typeof documentChunks.$inferSelect>>()

  for (const chunkRow of chunkRows) {
    const existing = chunksByDocumentId.get(chunkRow.documentId) || []
    existing.push(chunkRow)
    chunksByDocumentId.set(chunkRow.documentId, existing)
  }

  return documentRows.map((documentRow) => {
    const summaryRow = summaryMap.get(documentRow.id)

    if (!summaryRow) {
      throw new Error(`Missing summary row for document ${documentRow.id}`)
    }

    const orderedChunks = (chunksByDocumentId.get(documentRow.id) || []).sort(
      (left, right) => left.chunkIndex - right.chunkIndex
    )

    return {
      id: documentRow.id,
      title: documentRow.title,
      source: documentRow.source || undefined,
      originalContent: documentRow.originalContent,
      cleanedContent: documentRow.cleanedContent,
      createdAt: documentRow.createdAt.toISOString(),
      summary: {
        tlDr: summaryRow.tlDr,
        mainPoints: summaryRow.mainPoints,
        importantTerms: summaryRow.importantTerms,
      },
      insightReport: {
        insights: summaryRow.insights,
        actions: summaryRow.actions,
        followUpQuestions: summaryRow.followUpQuestions,
      },
      chunks: orderedChunks.map((chunkRow) => ({
        id: chunkRow.id,
        documentId: chunkRow.documentId,
        index: chunkRow.chunkIndex,
        text: chunkRow.text,
        embedding: chunkRow.embedding || [],
      })),
    }
  })
}

export const saveDocumentToPostgres = async (document: StoredDocument) => {
  const db = getDb()

  await db.transaction(async (tx) => {
    await tx.insert(documents).values({
      id: document.id,
      title: document.title,
      source: document.source || null,
      originalContent: document.originalContent,
      cleanedContent: document.cleanedContent,
      createdAt: new Date(document.createdAt),
    })

    await tx.insert(documentSummaries).values({
      documentId: document.id,
      tlDr: document.summary.tlDr,
      mainPoints: document.summary.mainPoints,
      importantTerms: document.summary.importantTerms,
      insights: document.insightReport.insights,
      actions: document.insightReport.actions,
      followUpQuestions: document.insightReport.followUpQuestions,
    })

    if (document.chunks.length > 0) {
      await tx.insert(documentChunks).values(
        document.chunks.map((chunk) => ({
          id: chunk.id,
          documentId: chunk.documentId,
          chunkIndex: chunk.index,
          text: chunk.text,
          embedding: chunk.embedding.length > 0 ? chunk.embedding : null,
        }))
      )
    }
  })

  return document
}

export const listPostgresDocuments = async (): Promise<DocumentListItem[]> => {
  const db = getDb()
  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      source: documents.source,
      createdAt: documents.createdAt,
      tlDr: documentSummaries.tlDr,
      actions: documentSummaries.actions,
    })
    .from(documents)
    .innerJoin(documentSummaries, eq(documentSummaries.documentId, documents.id))
    .orderBy(desc(documents.createdAt))

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    source: row.source || undefined,
    createdAt: row.createdAt.toISOString(),
    tlDr: row.tlDr,
    actionCount: row.actions.length,
  }))
}

export const getPostgresDocumentById = async (id: string) => {
  const db = getDb()
  const documentRows = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1)

  const documentRow = documentRows[0]

  if (!documentRow) {
    return null
  }

  const [summaryRows, chunkRows] = await Promise.all([
    db
      .select()
      .from(documentSummaries)
      .where(eq(documentSummaries.documentId, id))
      .limit(1),
    db
      .select()
      .from(documentChunks)
      .where(eq(documentChunks.documentId, id))
      .orderBy(asc(documentChunks.chunkIndex)),
  ])

  return mapRowsToStoredDocuments({
    documentRows: [documentRow],
    summaryRows,
    chunkRows,
  })[0] || null
}

export const getAllPostgresDocuments = async () => {
  const db = getDb()
  const documentRows = await db.select().from(documents).orderBy(desc(documents.createdAt))

  if (documentRows.length === 0) {
    return []
  }

  const documentIds = documentRows.map((row) => row.id)
  const [summaryRows, chunkRows] = await Promise.all([
    db
      .select()
      .from(documentSummaries)
      .where(inArray(documentSummaries.documentId, documentIds)),
    db
      .select()
      .from(documentChunks)
      .where(inArray(documentChunks.documentId, documentIds))
      .orderBy(asc(documentChunks.chunkIndex)),
  ])

  return mapRowsToStoredDocuments({
    documentRows,
    summaryRows,
    chunkRows,
  })
}

export const upsertPostgresDocument = async (document: StoredDocument) => {
  const existing = await getPostgresDocumentById(document.id)

  if (existing) {
    return existing
  }

  return saveDocumentToPostgres(document)
}
