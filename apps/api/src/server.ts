import express from 'express'
import cors from 'cors'
import { ZodError } from 'zod'
import { assertConfig, config, logModelConfiguration } from './config.js'
import { buildDocument, retrieverAgent } from './agents.js'
import { verifyDatabaseCapabilities } from './db/client.js'
import {
  getAllDocuments,
  getDocumentById,
  listDocuments,
  saveDocument,
} from './store.js'

const app = express()

app.use(
  cors({
    origin: config.clientOrigin,
  })
)
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
  })
})

app.get('/documents', async (_request, response, next) => {
  try {
    const documents = await listDocuments()
    response.json({ documents })
  } catch (error) {
    next(error)
  }
})

app.get('/documents/:id', async (request, response, next) => {
  try {
    const document = await getDocumentById(request.params.id)

    if (!document) {
      response.status(404).json({
        message: 'Document not found.',
      })
      return
    }

    response.json({ document })
  } catch (error) {
    next(error)
  }
})

app.post('/documents/ingest', async (request, response, next) => {
  try {
    const document = await buildDocument(request.body)
    await saveDocument(document)

    response.status(201).json({
      documentId: document.id,
      summary: document.summary,
      insights: document.insightReport.insights,
      actions: document.insightReport.actions,
      followUpQuestions: document.insightReport.followUpQuestions,
      chunkCount: document.chunks.length,
    })
  } catch (error) {
    next(error)
  }
})

app.post('/chat/query', async (request, response, next) => {
  try {
    const question = String(request.body?.question || '').trim()

    if (!question) {
      response.status(400).json({
        message: 'Question is required.',
      })
      return
    }

    const documents = await getAllDocuments()
    const result = await retrieverAgent({ question, documents })

    response.json(result)
  } catch (error) {
    next(error)
  }
})

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Invalid request payload.',
      issues: error.issues,
    })
    return
  }

  const message =
    error instanceof Error ? error.message : 'An unexpected server error occurred.'

  response.status(500).json({
    message,
  })
})

const start = async () => {
  assertConfig()
  logModelConfiguration()

  if (config.storageBackend === 'postgres') {
    await verifyDatabaseCapabilities()
  }

  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`)
  })
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
