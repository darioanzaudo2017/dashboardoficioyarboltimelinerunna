import { useState, useEffect, useCallback } from "react"
import type { EtapaDetailResponse } from "../../../../api/etapa-detail-api-service"
import type { WorkflowPhase } from "../../../../types/workflow"
import type { NotaAvalBasicResponse } from "../../../../types/nota-aval-api"
import type { RatificacionJudicial } from "../../../../types/ratificacion-judicial-api"
import type { TEstadoEtapaMedida } from "../../../../types/estado-etapa"

/**
 * Estado local del workflow.
 *
 * Los hooks se declaran en el MISMO ORDEN que en el archivo original
 * (12 `useState` -> `useEffect` de reset -> `useCallback` de refresh), de modo
 * que el orden de ejecución de hooks del componente queda idéntico.
 */
export const useWorkflowState = (
  workflowPhase: WorkflowPhase | undefined,
  onMedidaRefetch: (() => void) | undefined,
) => {
  const [activeStep, setActiveStep] = useState(0)
  const [etapaDetail, setEtapaDetail] = useState<EtapaDetailResponse | null>(null)
  const [notaAval, setNotaAval] = useState<NotaAvalBasicResponse | null>(null)
  const [informeJuridico, setInformeJuridico] = useState<boolean>(false)
  const [ratificacion, setRatificacion] = useState<RatificacionJudicial | null>(null)
  const [isLoadingWorkflowData, setIsLoadingWorkflowData] = useState(true)

  // V2 State: Estados catalog (kept for WorkflowStepper compatibility, always empty)
  const [estadosCatalog] = useState<TEstadoEtapaMedida[]>([])
  const [isLoadingEstados] = useState(false)

  // Etapa creation state
  const [iniciarEtapaDialogOpen, setIniciarEtapaDialogOpen] = useState(false)
  const [isCreatingEtapa, setIsCreatingEtapa] = useState(false)
  const [createEtapaError, setCreateEtapaError] = useState<string | null>(null)
  const [workflowRefreshKey, setWorkflowRefreshKey] = useState(0)

  // GAP-08: when there are multiple etapas of the same type, the user can
  // pick which one to view. Null = use the most recent one (default).
  const [selectedEtapaId, setSelectedEtapaId] = useState<number | null>(null)
  // Reset the selection whenever the user switches tabs.
  useEffect(() => {
    setSelectedEtapaId(null)
  }, [workflowPhase])

  // Allow children sections to force a workflow reload without reloading the page
  const refreshWorkflowData = useCallback(() => {
    setWorkflowRefreshKey((prev) => prev + 1)
    // Also trigger parent refetch to update medidaApiData
    onMedidaRefetch?.()
  }, [onMedidaRefetch])

  return {
    activeStep, setActiveStep,
    etapaDetail, setEtapaDetail,
    notaAval, setNotaAval,
    informeJuridico, setInformeJuridico,
    ratificacion, setRatificacion,
    isLoadingWorkflowData, setIsLoadingWorkflowData,
    estadosCatalog,
    isLoadingEstados,
    iniciarEtapaDialogOpen, setIniciarEtapaDialogOpen,
    isCreatingEtapa, setIsCreatingEtapa,
    createEtapaError, setCreateEtapaError,
    workflowRefreshKey,
    selectedEtapaId, setSelectedEtapaId,
    refreshWorkflowData,
  }
}
