import { ingestionStages } from '../lib/workflow-stages'

type WorkflowStagesProps = {
  activeStageIndex: number | null
  isSubmitting: boolean
}

export function WorkflowStages({
  activeStageIndex,
  isSubmitting,
}: WorkflowStagesProps) {
  return (
    <div className="workflowTrack" aria-label="Workflow stages">
      {ingestionStages.map((stage, index) => {
        const isActive = activeStageIndex === index
        const isComplete =
          activeStageIndex !== null && activeStageIndex > index

        return (
          <div className="workflowItem" key={stage}>
            <div
              className={[
                'tag',
                'workflowTag',
                isActive ? 'tagActive' : '',
                isComplete ? 'tagComplete' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="workflowDot" aria-hidden="true" />
              <span>{stage}</span>
            </div>
            {index < ingestionStages.length - 1 ? (
              <div
                className={[
                  'workflowConnector',
                  isSubmitting && isActive ? 'connectorActive' : '',
                  isComplete ? 'connectorComplete' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
