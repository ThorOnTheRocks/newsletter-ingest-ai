'use client'

import { useEffect, useRef, useState } from 'react'
import {
  getDocument,
  ingestDocument,
  listDocuments,
  queryKnowledge,
  type DocumentDetail,
  type DocumentListItem,
  type QueryResponse,
} from '../lib/api'
import { ingestionStages } from '../lib/workflow-stages'

export function useKnowledgeWorkspace() {
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [content, setContent] = useState('')
  const [question, setQuestion] = useState('')
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetail | null>(
    null
  )
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState(
    'Workspace ready for ingestion.'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)
  const [activeIngestionStageIndex, setActiveIngestionStageIndex] = useState<
    number | null
  >(null)
  const stageTimerRef = useRef<number | null>(null)

  const stopStageAnimation = () => {
    if (stageTimerRef.current !== null) {
      window.clearInterval(stageTimerRef.current)
      stageTimerRef.current = null
    }
  }

  const startStageAnimation = () => {
    stopStageAnimation()
    setActiveIngestionStageIndex(0)

    stageTimerRef.current = window.setInterval(() => {
      setActiveIngestionStageIndex((currentIndex) => {
        if (currentIndex === null) {
          return 0
        }

        return Math.min(currentIndex + 1, ingestionStages.length - 1)
      })
    }, 900)
  }

  const refreshDocuments = async () => {
    const response = await listDocuments()
    setDocuments(response.documents)
  }

  const selectDocument = async (documentId: string) => {
    setErrorMessage('')
    const response = await getDocument(documentId)
    setSelectedDocument(response.document)
  }

  useEffect(() => {
    refreshDocuments().catch((error: Error) => {
      setErrorMessage(error.message)
      setStatusMessage('Unable to load the document library.')
    })
    return () => {
      stopStageAnimation()
    }
  }, [])

  const submitIngestion = async () => {
    setIsSubmitting(true)
    startStageAnimation()
    setErrorMessage('')
    setStatusMessage('Running ingestion, summarization, insight extraction, and memory indexing...')

    try {
      const response = await ingestDocument({
        title: title || undefined,
        source: source || undefined,
        content,
      })

      setStatusMessage(
        `Ingestion complete. Indexed ${response.chunkCount} content chunks and published a new report.`
      )
      setQueryResult(null)
      setTitle('')
      setSource('')
      await refreshDocuments()
      await selectDocument(response.documentId)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to ingest document.'
      setErrorMessage(message)
      setStatusMessage('Ingestion failed. Review the request and retry.')
    } finally {
      stopStageAnimation()
      setActiveIngestionStageIndex(null)
      setIsSubmitting(false)
    }
  }

  const submitQuery = async () => {
    setIsQuerying(true)
    setErrorMessage('')

    try {
      const response = await queryKnowledge(question)
      setQueryResult(response)
      setStatusMessage(
        `Retrieved an answer from ${response.matchedDocumentIds.length || 0} indexed document${response.matchedDocumentIds.length === 1 ? '' : 's'}.`
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to query the knowledge base.'
      setErrorMessage(message)
      setStatusMessage('Retrieval failed. Review the question and retry.')
    } finally {
      setIsQuerying(false)
    }
  }

  return {
    form: {
      title,
      source,
      content,
      question,
    },
    documents,
    selectedDocument,
    queryResult,
    errorMessage,
    statusMessage,
    isSubmitting,
    isQuerying,
    activeIngestionStageIndex,
    actions: {
      setTitle,
      setSource,
      setContent,
      setQuestion,
      loadSample: () => undefined,
      submitIngestion,
      submitQuery,
      selectDocument,
    },
  }
}
