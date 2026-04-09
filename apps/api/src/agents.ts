import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import {
  embedText,
  isEmbeddingAccessError,
  openai,
  parseStructuredOutput,
} from './llm.js'
import type {
  InsightResult,
  StoredChunk,
  StoredDocument,
  SummaryResult,
} from './types.js'

const ingestPayloadSchema = z.object({
  title: z.string().trim().optional(),
  source: z.string().trim().optional(),
  content: z.string().trim().min(200, 'Content must be at least 200 characters long.'),
})

const summarySchema = z.object({
  tlDr: z.string(),
  mainPoints: z.array(z.string()).min(3).max(6),
  importantTerms: z.array(z.string()).min(3).max(8),
})

const insightSchema = z.object({
  insights: z.array(z.string()).min(3).max(6),
  actions: z.array(z.string()).min(2).max(5),
  followUpQuestions: z.array(z.string()).min(2).max(5),
})

const retrievalAnswerSchema = z.object({
  answer: z.string(),
  citations: z.array(
    z.object({
      documentId: z.string(),
      documentTitle: z.string(),
      chunkId: z.string(),
      excerpt: z.string(),
    })
  ),
})

export const validateIngestPayload = (payload: unknown) => {
  return ingestPayloadSchema.parse(payload)
}

export const cleanContent = (content: string) => {
  return content.replace(/\s+/g, ' ').trim()
}

export const createTitleFromContent = (content: string) => {
  const firstSentence = content.split(/[.!?]/)[0] || 'Untitled newsletter'
  return firstSentence.slice(0, 80).trim()
}

export const chunkContent = (content: string, chunkSize = 1200) => {
  const words = content.split(' ')
  const chunks: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word

    if (candidate.length > chunkSize && current) {
      chunks.push(current)
      current = word
      continue
    }

    current = candidate
  }

  if (current) {
    chunks.push(current)
  }

  return chunks
}

export const summarizationAgent = async (content: string): Promise<SummaryResult> => {
  return parseStructuredOutput<SummaryResult>({
    schema: summarySchema,
    promptName: 'newsletter_summary',
    system:
      'You summarize newsletters and articles into concise, structured outputs for knowledge retrieval. Focus on clarity, not hype.',
    user: `Summarize the following content. Return a short tl;dr, 3-6 main points, and a short list of important terms.\n\n${content}`,
  })
}

export const insightAgent = async (
  content: string,
  summary: SummaryResult
): Promise<InsightResult> => {
  return parseStructuredOutput<InsightResult>({
    schema: insightSchema,
    promptName: 'newsletter_insights',
    system:
      'You extract practical insights from newsletters and articles. Focus on implications, useful takeaways, and sensible next steps.',
    user: `Content:\n${content}\n\nSummary:\n${JSON.stringify(summary, null, 2)}\n\nExtract key insights, sensible actions or follow-ups, and useful follow-up questions.`,
  })
}

export const memoryAgent = async (
  documentId: string,
  content: string
): Promise<StoredChunk[]> => {
  const chunkTexts = chunkContent(content)
  const chunks: StoredChunk[] = []
  let embeddingsUnavailable = false

  for (const [index, chunkText] of chunkTexts.entries()) {
    let embedding: number[] = []

    if (!embeddingsUnavailable) {
      try {
        embedding = await embedText(chunkText)
      } catch (error) {
        if (isEmbeddingAccessError(error)) {
          embeddingsUnavailable = true
          console.warn(
            'Embeddings are unavailable for the current project. Falling back to lexical retrieval for this session.'
          )
        } else {
          throw error
        }
      }
    }

    chunks.push({
      id: randomUUID(),
      documentId,
      index,
      text: chunkText,
      embedding,
    })
  }

  return chunks
}

export const buildDocument = async (payload: unknown): Promise<StoredDocument> => {
  const parsed = validateIngestPayload(payload)
  const cleanedContent = cleanContent(parsed.content)
  const title = parsed.title || createTitleFromContent(cleanedContent)
  const id = randomUUID()
  const summary = await summarizationAgent(cleanedContent)
  const insightReport = await insightAgent(cleanedContent, summary)
  const chunks = await memoryAgent(id, cleanedContent)

  return {
    id,
    title,
    source: parsed.source,
    originalContent: parsed.content,
    cleanedContent,
    createdAt: new Date().toISOString(),
    summary,
    insightReport,
    chunks,
  }
}

const cosineSimilarity = (a: number[], b: number[]) => {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0
  }

  let dot = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index]
    magnitudeA += a[index] * a[index]
    magnitudeB += b[index] * b[index]
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }

  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)

const lexicalSimilarity = (question: string, chunkText: string) => {
  const questionTokens = new Set(normalizeText(question))
  const chunkTokens = normalizeText(chunkText)

  if (questionTokens.size === 0 || chunkTokens.length === 0) {
    return 0
  }

  let matches = 0

  for (const token of chunkTokens) {
    if (questionTokens.has(token)) {
      matches += 1
    }
  }

  return matches / chunkTokens.length
}

export const retrieverAgent = async ({
  question,
  documents,
}: {
  question: string
  documents: StoredDocument[]
}) => {
  const hasEmbeddings = documents.some((document) =>
    document.chunks.some((chunk) => chunk.embedding.length > 0)
  )

  let rankedChunks: Array<{
    chunk: StoredChunk
    document: StoredDocument
    score: number
  }> = []

  if (hasEmbeddings) {
    try {
      const queryEmbedding = await embedText(question)
      rankedChunks = documents
        .flatMap((document) =>
          document.chunks.map((chunk) => ({
            chunk,
            document,
            score: cosineSimilarity(queryEmbedding, chunk.embedding),
          }))
        )
        .sort((left, right) => right.score - left.score)
        .slice(0, 5)
    } catch (error) {
      if (!isEmbeddingAccessError(error)) {
        throw error
      }
    }
  }

  if (rankedChunks.length === 0) {
    rankedChunks = documents
      .flatMap((document) =>
        document.chunks.map((chunk) => ({
          chunk,
          document,
          score: lexicalSimilarity(question, chunk.text),
        }))
      )
      .sort((left, right) => right.score - left.score)
      .slice(0, 5)
  }

  if (rankedChunks.length === 0) {
    return {
      answer:
        'I do not have any stored documents yet, so I cannot answer that question.',
      citations: [],
      matchedDocumentIds: [],
    }
  }

  const context = rankedChunks
    .map(
      ({ chunk, document }, index) =>
        `Source ${index + 1}\nDocument ID: ${document.id}\nTitle: ${document.title}\nChunk ID: ${chunk.id}\nExcerpt: ${chunk.text}`
    )
    .join('\n\n')

const parsed = await parseStructuredOutput<z.infer<typeof retrievalAnswerSchema>>({
    schema: retrievalAnswerSchema,
    promptName: 'retrieval_answer',
    system:
      'Answer only from the provided context. If the context is weak or incomplete, say that clearly. Cite the supporting excerpts you relied on.',
    user: `Question: ${question}\n\nContext:\n${context}`,
  })

  return {
    answer: parsed.answer,
    citations: parsed.citations,
    matchedDocumentIds: [...new Set(parsed.citations.map((citation) => citation.documentId))],
  }
}

export const healthcheckAgent = async () => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: 'Reply with the single word ok.',
      },
    ],
    temperature: 0,
    max_tokens: 5,
  })

  return response.choices[0]?.message?.content?.trim() || 'unknown'
}
