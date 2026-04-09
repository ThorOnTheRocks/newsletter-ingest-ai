import { FormEvent } from 'react'
import { type QueryResponse } from '../lib/api'

type QueryPanelProps = {
  question: string
  queryResult: QueryResponse | null
  isQuerying: boolean
  onQuestionChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function QueryPanel({
  question,
  queryResult,
  isQuerying,
  onQuestionChange,
  onSubmit,
}: QueryPanelProps) {
  return (
    <section className="panel stack">
      <div className="panelHeader">
        <h2>Retrieval workspace</h2>
        <p className="meta">
          Query previously indexed content and return grounded answers with
          supporting excerpts.
        </p>
      </div>

      <form className="stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="question">Research question</label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            style={{ minHeight: 120 }}
            placeholder="Ask a grounded question across indexed knowledge, for example: What have we stored about agent reliability?"
          />
        </div>
        <button className="primaryButton" type="submit" disabled={isQuerying}>
          {isQuerying ? 'Retrieving...' : 'Run retrieval'}
        </button>
      </form>

      {queryResult ? (
        <div className="answerBox">
          <strong>Grounded response</strong>
          <div>{queryResult.answer}</div>
          {queryResult.citations.map((citation) => (
            <div className="citation" key={citation.chunkId}>
              <strong>{citation.documentTitle}</strong>
              <div className="meta">{citation.documentId}</div>
              <div>{citation.excerpt}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="meta">
          Retrieval results will appear here after at least one document has been
          indexed.
        </p>
      )}
    </section>
  )
}
