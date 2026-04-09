import { WorkflowStages } from './workflow-stages'

type WorkspaceHeroProps = {
  documentCount: number
  statusMessage: string
  isSubmitting: boolean
  activeStageIndex: number | null
}

export function WorkspaceHero({
  documentCount,
  statusMessage,
  isSubmitting,
  activeStageIndex,
}: WorkspaceHeroProps) {
  return (
    <section className="hero">
      <div className="heroCopy">
        <span className="eyebrow">Newsletter AI Assistant</span>
        <h1>Turn every newsletter into a brief your team can reuse.</h1>
        <p className="heroLead">
          Paste a market note, operator memo, or industry roundup. The workspace
          distills the signal, indexes the source, and keeps every follow-up
          answer grounded in what your team has actually stored.
        </p>

        <div className="heroActions">
          <a className="primaryButton" href="#source-intake">
            Add a source
          </a>
          <a className="secondaryButton" href="#knowledge-archive">
            Browse archive
          </a>
        </div>
      </div>

      <div className="heroRail">
        <div className="heroStatus">
          <span className="eyebrow eyebrowMuted">Live workflow</span>
          <strong>{isSubmitting ? 'Processing now' : 'Workspace ready'}</strong>
          <p>{statusMessage}</p>
        </div>

        <WorkflowStages
          activeStageIndex={activeStageIndex}
          isSubmitting={isSubmitting}
        />

        <dl className="heroStats">
          <div>
            <dt>Indexed sources</dt>
            <dd>{documentCount}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>{isSubmitting ? 'Ingestion' : 'Research'}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
