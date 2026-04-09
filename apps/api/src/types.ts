export type StoredChunk = {
  id: string
  documentId: string
  index: number
  text: string
  embedding: number[]
}

export type SummaryResult = {
  tlDr: string
  mainPoints: string[]
  importantTerms: string[]
}

export type InsightResult = {
  insights: string[]
  actions: string[]
  followUpQuestions: string[]
}

export type StoredDocument = {
  id: string
  title: string
  source?: string
  originalContent: string
  cleanedContent: string
  createdAt: string
  summary: SummaryResult
  insightReport: InsightResult
  chunks: StoredChunk[]
}

export type Database = {
  documents: StoredDocument[]
}

export type DocumentListItem = {
  id: string
  title: string
  source?: string
  createdAt: string
  tlDr: string
  actionCount: number
}
