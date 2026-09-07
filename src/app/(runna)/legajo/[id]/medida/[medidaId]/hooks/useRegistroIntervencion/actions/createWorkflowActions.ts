import type { QueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { track, AnalyticsEvent } from "@/utils/analytics"
import {
  enviarIntervencion,
  aprobarIntervencion,
  rechazarIntervencion,
} from "../../../api/intervenciones-api-service"
import { medidaKeys } from "../../useMedidaDetail"
import { logger } from "@/utils/logger"
import { intervencionesListKey } from "../constants"
import type { IntervencionResponse } from "../../../types/intervencion-api"
import type { RegistroIntervencionState } from "../state/useRegistroIntervencionState"

interface WorkflowActionsParams {
  medidaId: number
  intervencionId?: number
  queryClient: QueryClient
  intervencion: RegistroIntervencionState["intervencion"]
  setIntervencion: RegistroIntervencionState["setIntervencion"]
  setIsEnviando: RegistroIntervencionState["setIsEnviando"]
  setIsAprobando: RegistroIntervencionState["setIsAprobando"]
  setIsRechazando: RegistroIntervencionState["setIsRechazando"]
  setError: RegistroIntervencionState["setError"]
}

export function createWorkflowActions({
  medidaId,
  intervencionId,
  queryClient,
  intervencion,
  setIntervencion,
  setIsEnviando,
  setIsAprobando,
  setIsRechazando,
  setError,
}: WorkflowActionsParams) {
  // ============================================================================
  // API CALLS - STATE TRANSITIONS
  // ============================================================================

  /**
   * Enviar intervención a aprobación (ET → JZ)
   * Estado 1 → Estado 2 (BORRADOR → ENVIADO)
   */
  const enviar = async (): Promise<boolean> => {
    // Use prop intervencionId, or fallback to the ID from a just-created intervention
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("No se puede enviar: guarde la intervención primero")
      return false
    }

    setIsEnviando(true)
    setError(null)

    try {
      const response = await enviarIntervencion(medidaId, effectiveId)
      setIntervencion(response.intervencion)

      track(AnalyticsEvent.INTERVENCION_ENVIADA, {
        medida_id: medidaId,
        intervencion_id: effectiveId,
        flujo: "enviar",
      })

      toast.success('Intervención enviada exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Force immediate refetch to update UI with new workflow state
      try {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        logger.warn('[useRegistroIntervencion] Cache refetch failed (enviar):', refetchErr)
        // Fallback to invalidation
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return true
    } catch (err: any) {
      logger.error("Error enviando intervención:", err)
      const errorMsg = err?.response?.data?.detail || "Error al enviar la intervención"
      setError(errorMsg)
      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 5000,
      })
      return false
    } finally {
      setIsEnviando(false)
    }
  }

  /**
   * Aprobar intervención (JZ)
   * Estado 2 → Estado 3 (ENVIADO → APROBADO)
   */
  const aprobar = async (): Promise<boolean> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("No se puede aprobar: ID de intervención no definido")
      return false
    }

    setIsAprobando(true)
    setError(null)

    try {
      const response = await aprobarIntervencion(medidaId, effectiveId)

      // Response IS the intervention data directly (not nested under .intervencion)
      // Map medida object back to number for local state compatibility
      setIntervencion({
        ...response,
        medida: response.medida.id,
      } as IntervencionResponse)

      track(AnalyticsEvent.INTERVENCION_APROBADA, {
        medida_id: medidaId,
        intervencion_id: effectiveId,
      })

      toast.success('Intervención aprobada exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Update cache directly with response data, then refetch for full sync
      try {
        // Response contains medida.etapa_actual with the new workflow state
        if (response.medida?.etapa_actual) {
          logger.log('[aprobar] Updating cache with new etapa_actual:', response.medida.etapa_actual)
          queryClient.setQueryData(
            medidaKeys.detail(medidaId),
            (oldData: any) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                etapa_actual: response.medida.etapa_actual,
                etapa_actual_detalle: response.medida.etapa_actual,
              }
            }
          )
        }

        // Also refetch to ensure full sync
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        logger.warn('[useRegistroIntervencion] Cache update failed (aprobar):', refetchErr)
        // Fallback to invalidation
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return true
    } catch (err: any) {
      logger.error("Error aprobando intervención:", err)
      const errorMsg = err?.response?.data?.detail || "Error al aprobar la intervención"
      setError(errorMsg)
      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 5000,
      })
      return false
    } finally {
      setIsAprobando(false)
    }
  }

  /**
   * Rechazar intervención (JZ)
   * Estado 2 → Estado 1 (ENVIADO → RECHAZADO → BORRADOR)
   */
  const rechazar = async (observaciones: string): Promise<boolean> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("No se puede rechazar: ID de intervención no definido")
      return false
    }

    if (!observaciones || observaciones.trim() === "") {
      setError("Debe proporcionar observaciones para rechazar")
      return false
    }

    setIsRechazando(true)
    setError(null)

    try {
      const response = await rechazarIntervencion(medidaId, effectiveId, {
        observaciones: observaciones,
      })

      // Response IS the intervention data directly (not nested under .intervencion)
      // Map medida object back to number for local state compatibility
      setIntervencion({
        ...response,
        medida: response.medida.id,
      } as IntervencionResponse)

      track(AnalyticsEvent.INTERVENCION_RECHAZADA, {
        medida_id: medidaId,
        intervencion_id: effectiveId,
      })

      toast.info('Intervención rechazada. Se notificó al equipo técnico', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Update cache directly with response data, then refetch for full sync
      try {
        // Response contains medida.etapa_actual with the new workflow state
        if (response.medida?.etapa_actual) {
          logger.log('[rechazar] Updating cache with new etapa_actual:', response.medida.etapa_actual)
          queryClient.setQueryData(
            medidaKeys.detail(medidaId),
            (oldData: any) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                etapa_actual: response.medida.etapa_actual,
                etapa_actual_detalle: response.medida.etapa_actual,
              }
            }
          )
        }

        // Also refetch to ensure full sync
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        logger.warn('[useRegistroIntervencion] Cache refetch failed (rechazar):', refetchErr)
        // Fallback to invalidation
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return true
    } catch (err: any) {
      logger.error("Error rechazando intervención:", err)
      const errorMsg = err?.response?.data?.detail || "Error al rechazar la intervención"
      setError(errorMsg)
      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 5000,
      })
      return false
    } finally {
      setIsRechazando(false)
    }
  }

  return { enviar, aprobar, rechazar }
}
