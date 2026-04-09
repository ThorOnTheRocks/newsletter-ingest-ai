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
    <section className="workspaceSection stack intakeSection" id="source-intake">
      <div className="panelHeader">
        <span className="sectionKicker">Intake</span>
        <h2>Add a source</h2>
        <p className="meta">
          Drop in a newsletter, memo, or market note to generate a reusable
          brief and searchable memory.
        </p>
      </div>

      <WorkflowStages
        activeStageIndex={activeStageIndex}
        isSubmitting={isSubmitting}
      />

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
            placeholder="Benedict Evans, internal strategy, a16z..."
          />
        </div>

        <div className="field">
          <label htmlFor="content">Source content</label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="Paste the full text here. The assistant will summarize it, pull out themes and actions, and index it for grounded follow-up questions."
          />
        </div>

        <div className="row">
          <button className="primaryButton" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Building brief...' : 'Generate brief'}
          </button>
        </div>
      </form>
    </section>
  )
}
