import { type DocumentListItem } from '../lib/api'

type DocumentLibraryProps = {
  documents: DocumentListItem[]
  onSelectDocument: (documentId: string) => void | Promise<void>
}

export function DocumentLibrary({
  documents,
  onSelectDocument,
}: DocumentLibraryProps) {
  return (
    <section className="panel libraryPanel">
      <div className="panelHeader">
        <h2>Knowledge library</h2>
        <p className="meta">
          Review indexed documents and reopen the latest analysis package.
        </p>
      </div>

      <div className="documentList documentListScrollable">
        {documents.length === 0 ? (
          <p className="meta">No indexed documents available yet.</p>
        ) : (
          documents.map((document) => (
            <article className="documentCard" key={document.id}>
              <strong>{document.title}</strong>
              <div className="meta">
                {new Date(document.createdAt).toLocaleString()}
                {document.source ? ` • ${document.source}` : ''}
              </div>
              <div>{document.tlDr}</div>
              <button
                className="secondaryButton"
                type="button"
                onClick={() => void onSelectDocument(document.id)}
              >
                Open analysis
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
