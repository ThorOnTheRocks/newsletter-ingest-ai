import { type DocumentListItem } from '../lib/api'

type DocumentLibraryProps = {
  documents: DocumentListItem[]
  selectedDocumentId: string | null
  onSelectDocument: (documentId: string) => void | Promise<void>
}

export function DocumentLibrary({
  documents,
  selectedDocumentId,
  onSelectDocument,
}: DocumentLibraryProps) {
  return (
    <section className="workspaceSection libraryPanel" id="knowledge-archive">
      <div className="panelHeader">
        <span className="sectionKicker">Archive</span>
        <h2>Indexed library</h2>
        <p className="meta">
          Reopen stored briefs, inspect summaries, and jump back into the last
          useful source.
        </p>
      </div>

      <div className="documentList documentListScrollable">
        {documents.length === 0 ? (
          <p className="meta">No sources indexed yet. Add one to start the archive.</p>
        ) : (
          documents.map((document) => (
            <article
              className={[
                'documentCard',
                selectedDocumentId === document.id ? 'documentCardSelected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={document.id}
            >
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
                {selectedDocumentId === document.id ? 'Open brief' : 'View brief'}
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
