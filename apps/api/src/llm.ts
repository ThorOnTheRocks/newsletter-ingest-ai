import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import type { ZodTypeAny } from 'zod'
import { config } from './config.js'

export const openai = new OpenAI({
  apiKey: config.openAiApiKey,
})

export const parseStructuredOutput = async <T>({
  schema,
  promptName,
  system,
  user,
}: {
  schema: ZodTypeAny
  promptName: string
  system: string
  user: string
}): Promise<T> => {
  const response = await openai.beta.chat.completions.parse({
    model: config.openAiModel,
    temperature: 0.2,
    response_format: zodResponseFormat(schema, promptName),
    messages: [
      {
        role: 'system',
        content: system,
      },
      {
        role: 'user',
        content: user,
      },
    ],
  })

  const parsed = response.choices[0].message.parsed

  if (!parsed) {
    throw new Error(`Model did not return a parsed ${promptName} payload.`)
  }

  return parsed as T
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export const isEmbeddingAccessError = (error: unknown) => {
  const message = getErrorMessage(error)

  return (
    message.includes('does not have access to model') ||
    message.includes('text-embedding-3-small') ||
    message.includes('embeddings')
  )
}

export const embedText = async (text: string) => {
  try {
    const response = await openai.embeddings.create({
      model: config.embeddingModel,
      input: text,
    })

    return response.data[0]?.embedding || []
  } catch (error) {
    if (isEmbeddingAccessError(error)) {
      const message = getErrorMessage(error)

      throw new Error(
        `Embedding request failed for model "${config.embeddingModel}". The current API key's project does not appear to have access to that model. Update EMBEDDING_MODEL or use an API key from a project with embedding access. Original error: ${message}`
      )
    }

    throw error
  }
}
