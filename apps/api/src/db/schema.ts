import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { vector } from './vector.js'

export const documents = pgTable(
  'documents',
  {
    id: varchar('id', { length: 191 }).primaryKey(),
    title: text('title').notNull(),
    source: text('source'),
    originalContent: text('original_content').notNull(),
    cleanedContent: text('cleaned_content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    createdAtIdx: index('documents_created_at_idx').on(table.createdAt),
  })
)

export const documentSummaries = pgTable('document_summaries', {
  documentId: varchar('document_id', { length: 191 })
    .primaryKey()
    .references(() => documents.id, { onDelete: 'cascade' }),
  tlDr: text('tl_dr').notNull(),
  mainPoints: jsonb('main_points').$type<string[]>().notNull(),
  importantTerms: jsonb('important_terms').$type<string[]>().notNull(),
  insights: jsonb('insights').$type<string[]>().notNull(),
  actions: jsonb('actions').$type<string[]>().notNull(),
  followUpQuestions: jsonb('follow_up_questions').$type<string[]>().notNull(),
})

export const documentChunks = pgTable(
  'document_chunks',
  {
    id: varchar('id', { length: 191 }).primaryKey(),
    documentId: varchar('document_id', { length: 191 })
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    text: text('text').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }),
  },
  (table) => ({
    documentChunkIdx: index('document_chunks_document_id_chunk_index_idx').on(
      table.documentId,
      table.chunkIndex
    ),
  })
)
