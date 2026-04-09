import { type DocumentDetail } from '../lib/api'

type ReportPanelProps = {
  document: DocumentDetail | null
}

const ListSection = ({
  title,
  items,
}: {
  title: string
  items: string[]
}) => (
  <div>
    <strong>{title}</strong>
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)

export function ReportPanel({ document }: ReportPanelProps) {
  return (
    <section className="workspaceSection stack reportPanel" id="analysis-brief">
      <div className="panelHeader">
        <span className="sectionKicker">Output</span>
        <h2>Analysis brief</h2>
        <p className="meta">
          Review the structured brief generated from the selected source.
        </p>
      </div>

      {document ? (
        <div className="stack reportContent">
          <div className="reportHeadline">
            <h3>{document.title}</h3>
            <div className="meta">
              {new Date(document.createdAt).toLocaleString()}
              {document.source ? ` • ${document.source}` : ''}
            </div>
          </div>

          <div className="sectionList">
            <div>
              <strong>Summary</strong>
              <p>{document.summary.tlDr}</p>
            </div>
            <ListSection
              title="Primary themes"
              items={document.summary.mainPoints}
            />
            <ListSection
              title="Key terms"
              items={document.summary.importantTerms}
            />
            <ListSection
              title="Decision-relevant insights"
              items={document.insightReport.insights}
            />
            <ListSection
              title="Recommended follow-up actions"
              items={document.insightReport.actions}
            />
            <ListSection
              title="Open questions"
              items={document.insightReport.followUpQuestions}
            />
          </div>
        </div>
      ) : (
        <p className="meta">
          Select a source from the archive to open its latest brief.
        </p>
      )}
    </section>
  )
}
