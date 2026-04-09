'use client'

import { FormEvent } from 'react'
import { useKnowledgeWorkspace } from '../hooks/use-knowledge-workspace'
import { WorkspaceHero } from './workspace-hero'
import { IngestionPanel } from './ingestion-panel'
import { DocumentLibrary } from './document-library'
import { QueryPanel } from './query-panel'
import { ReportPanel } from './report-panel'
import { StatusBanner } from './status-banner'

export function Dashboard() {
  const workspace = useKnowledgeWorkspace()

  const handleIngest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void workspace.actions.submitIngestion()
  }

  const handleQuery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void workspace.actions.submitQuery()
  }

  return (
    <main className="appShell">
      <WorkspaceHero
        documentCount={workspace.documents.length}
        statusMessage={workspace.statusMessage}
        isSubmitting={workspace.isSubmitting}
        activeStageIndex={workspace.activeIngestionStageIndex}
      />

      <div className="workspaceLayout">
        <section className="stack">
          <IngestionPanel
            title={workspace.form.title}
            source={workspace.form.source}
            content={workspace.form.content}
            isSubmitting={workspace.isSubmitting}
            activeStageIndex={workspace.activeIngestionStageIndex}
            onTitleChange={workspace.actions.setTitle}
            onSourceChange={workspace.actions.setSource}
            onContentChange={workspace.actions.setContent}
            onSubmit={handleIngest}
          />
          <StatusBanner
            errorMessage={workspace.errorMessage}
            statusMessage={workspace.statusMessage}
          />
        </section>

        <aside className="stack">
          <DocumentLibrary
            documents={workspace.documents}
            selectedDocumentId={workspace.selectedDocument?.id ?? null}
            onSelectDocument={workspace.actions.selectDocument}
          />
          <QueryPanel
            question={workspace.form.question}
            queryResult={workspace.queryResult}
            isQuerying={workspace.isQuerying}
            onQuestionChange={workspace.actions.setQuestion}
            onSubmit={handleQuery}
          />
        </aside>
      </div>

      <ReportPanel document={workspace.selectedDocument} />
    </main>
  )
}
