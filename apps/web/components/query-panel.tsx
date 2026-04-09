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
    <section className="workspaceSection stack">
      <div className="panelHeader">
        <span className="sectionKicker">Retrieval</span>
        <h2>Ask the archive</h2>
        <p className="meta">
          Search across stored sources and return a grounded answer with the
          excerpts that support it.
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
            placeholder="What have we saved about AI agent reliability, pricing pressure, GTM shifts, or hiring signals?"
          />
        </div>
        <button className="primaryButton" type="submit" disabled={isQuerying}>
          {isQuerying ? 'Searching archive...' : 'Run question'}
        </button>
      </form>

      {queryResult ? (
        <div className="answerBox">
          <strong>Grounded answer</strong>
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
          Answers appear here once at least one source has been indexed.
        </p>
      )}
    </section>
  )
}
