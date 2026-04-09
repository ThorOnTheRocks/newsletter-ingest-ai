export const ingestionStages = [
  'Ingestion',
  'Summarization',
  'Insight Extraction',
  'Memory Indexing',
] as const

export type IngestionStage = (typeof ingestionStages)[number]
