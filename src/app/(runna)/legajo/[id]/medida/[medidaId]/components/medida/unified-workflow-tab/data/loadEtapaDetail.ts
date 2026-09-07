import { getEtapaDetail, type EtapaDetailResponse } from "../../../../api/etapa-detail-api-service"
import { workflowPhaseToTipoEtapa } from "../../../../utils/workflow-tipo-mapper"
import type { WorkflowPhase } from "../../../../types/workflow"
import type { NotaAvalBasicResponse } from "../../../../types/nota-aval-api"
import type { RatificacionJudicial } from "../../../../types/ratificacion-judicial-api"
import { logger } from "@/utils/logger"

interface LoadEtapaDetailParams {
  medidaId: number
  workflowPhase: WorkflowPhase | undefined
  selectedEtapaId: number | null
  legajoOpticaId: number | undefined
  setEtapaDetail: (v: EtapaDetailResponse | null) => void
  setNotaAval: (v: NotaAvalBasicResponse | null) => void
  setInformeJuridico: (v: boolean) => void
  setRatificacion: (v: RatificacionJudicial | null) => void
  setIsLoadingWorkflowData: (v: boolean) => void
}

/**
 * Cuerpo de `fetchEtapaDetail`, movido tal cual desde el `useEffect` original.
 * El efecto sigue viviendo en el componente con el mismo array de dependencias.
 */
export const loadEtapaDetail = async ({
  medidaId,
  workflowPhase,
  selectedEtapaId,
  legajoOpticaId,
  setEtapaDetail,
  setNotaAval,
  setInformeJuridico,
  setRatificacion,
  setIsLoadingWorkflowData,
}: LoadEtapaDetailParams) => {
      if (!workflowPhase) {
        logger.warn('[UnifiedWorkflowTab] No workflowPhase provided, skipping etapa detail fetch')
        setIsLoadingWorkflowData(false)
        return
      }

      try {
        setIsLoadingWorkflowData(true)

        const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)

        logger.log(`[UnifiedWorkflowTab] Fetching etapa detail for ${tipoEtapa}`)

        // Single API call gets ALL documents for this etapa.
        // GAP-08: pass selectedEtapaId when the user picked a specific one
        // from the historial selector (else backend returns latest).
        // Medida compartida: legajoOpticaId filtra la selección por defecto y
        // etapas_mismo_tipo a grupales + las de este legajo (commit c29af1f).
        const detail = await getEtapaDetail(
          medidaId,
          tipoEtapa,
          selectedEtapaId ?? undefined,
          legajoOpticaId,
        )

        if (!detail) {
          // Etapa doesn't exist yet (404) - normal for non-Apertura stages
          logger.log(`[UnifiedWorkflowTab] Etapa ${tipoEtapa} not found (not created yet)`)
          setEtapaDetail(null)
          setNotaAval(null)
          setInformeJuridico(false)
          setRatificacion(null)
        } else {
          // Extract documents from etapa detail
          const docs = detail.etapa.documentos

          logger.log(`[UnifiedWorkflowTab] Etapa detail loaded:`, {
            tipo_etapa: detail.etapa.tipo_etapa,
            estado_actual: detail.etapa.estado_actual?.nombre_display,
            intervenciones: docs.intervenciones.length,
            notas_aval: docs.notas_aval.length,
            informes_juridicos: docs.informes_juridicos.length,
            ratificaciones: docs.ratificaciones.length,
          })

          setEtapaDetail(detail)

          // Extract individual documents for backward compatibility with existing code
          setNotaAval(docs.notas_aval.length > 0 ? docs.notas_aval[0] : null)
          setInformeJuridico(docs.informes_juridicos.length > 0)
          setRatificacion(docs.ratificaciones.length > 0 ? docs.ratificaciones[0] : null)
        }
      } catch (error) {
        logger.error("[UnifiedWorkflowTab] Error fetching etapa detail:", error)
        setEtapaDetail(null)
        setNotaAval(null)
        setInformeJuridico(false)
        setRatificacion(null)
      } finally {
        setIsLoadingWorkflowData(false)
      }
}
