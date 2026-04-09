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
    <section className="panel stack reportPanel">
      <div className="panelHeader">
        <h2>Analysis package</h2>
        <p className="meta">
          Review the structured output generated from the selected source
          document.
        </p>
      </div>

      {document ? (
        <div className="stack">
          <div>
            <h3>{document.title}</h3>
            <div className="meta">
              {new Date(document.createdAt).toLocaleString()}
              {document.source ? ` • ${document.source}` : ''}
            </div>
          </div>

          <div className="sectionList">
            <div>
              <strong>Executive summary</strong>
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
          Select an indexed document to review its current analysis package.
        </p>
      )}
    </section>
  )
}
