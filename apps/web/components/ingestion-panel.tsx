import { FormEvent } from 'react'
import { WorkflowStages } from './workflow-stages'

type IngestionPanelProps = {
  title: string
  source: string
  content: string
  isSubmitting: boolean
  activeStageIndex: number | null
  onTitleChange: (value: string) => void
  onSourceChange: (value: string) => void
  onContentChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function IngestionPanel({
  title,
  source,
  content,
  isSubmitting,
  activeStageIndex,
  onTitleChange,
  onSourceChange,
  onContentChange,
  onSubmit,
}: IngestionPanelProps) {
  return (
    <section className="panel stack">
      <WorkflowStages
        activeStageIndex={activeStageIndex}
        isSubmitting={isSubmitting}
      />

      <div className="panelHeader">
        <h2>Source intake</h2>
        <p className="meta">
          Submit long-form content for normalization, structured analysis, and
          retrieval indexing.
        </p>
      </div>

      <form className="stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="title">Document title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Q2 Applied AI market brief"
          />
        </div>

        <div className="field">
          <label htmlFor="source">Source or publication</label>
          <input
            id="source"
            value={source}
            onChange={(event) => onSourceChange(event.target.value)}
            placeholder="Internal research team"
          />
        </div>

        <div className="field">
          <label htmlFor="content">Source content</label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="Paste a newsletter, research note, market brief, or internal memo for structured processing."
          />
        </div>

        <div className="row">
          <button className="primaryButton" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Running workflow...' : 'Process document'}
          </button>
        </div>
      </form>
    </section>
  )
}
