const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    let message = 'The request failed.'

    try {
      const body = (await response.json()) as { message?: string }
      message = body.message || message
    } catch {
      // Ignore invalid error responses.
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}

export type DocumentListItem = {
  id: string
  title: string
  source?: string
  createdAt: string
  tlDr: string
  actionCount: number
}

export type DocumentDetail = {
  id: string
  title: string
  source?: string
  createdAt: string
  summary: {
    tlDr: string
    mainPoints: string[]
    importantTerms: string[]
  }
  insightReport: {
    insights: string[]
    actions: string[]
    followUpQuestions: string[]
  }
}

export type QueryResponse = {
  answer: string
  citations: Array<{
    documentId: string
    documentTitle: string
    chunkId: string
    excerpt: string
  }>
  matchedDocumentIds: string[]
}

export const listDocuments = () =>
  request<{ documents: DocumentListItem[] }>('/documents')

export const getDocument = (id: string) =>
  request<{ document: DocumentDetail }>(`/documents/${id}`)

export const ingestDocument = (payload: {
  title?: string
  source?: string
  content: string
}) =>
  request<{
    documentId: string
    summary: DocumentDetail['summary']
    insights: string[]
    actions: string[]
    followUpQuestions: string[]
    chunkCount: number
  }>('/documents/ingest', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const queryKnowledge = (question: string) =>
  request<QueryResponse>('/chat/query', {
    method: 'POST',
    body: JSON.stringify({ question }),
  })
