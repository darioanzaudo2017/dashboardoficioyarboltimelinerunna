import type { QueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { track, AnalyticsEvent } from "@/utils/analytics"
import {
  createIntervencion,
  updateIntervencion,
  crearYEnviarIntervencion,
  type CrearYEnviarRequest,
  type CrearYEnviarResponse,
} from "../../../api/intervenciones-api-service"
import { medidaKeys } from "../../useMedidaDetail"
import { logger } from "@/utils/logger"
import { intervencionesListKey } from "../constants"
import type {
  CreateIntervencionRequest,
  UpdateIntervencionRequest,
  IntervencionResponse,
} from "../../../types/intervencion-api"
import type { UseRegistroIntervencionOptions, ValidationErrors } from "../types"
import type { RegistroIntervencionState } from "../state/useRegistroIntervencionState"

interface SaveActionsParams {
  medidaId: number
  intervencionId?: number
  workflowPhase: UseRegistroIntervencionOptions["workflowPhase"]
  queryClient: QueryClient
  formData: RegistroIntervencionState["formData"]
  intervencion: RegistroIntervencionState["intervencion"]
  setIntervencion: RegistroIntervencionState["setIntervencion"]
  setIsSaving: RegistroIntervencionState["setIsSaving"]
  setIsEnviando: RegistroIntervencionState["setIsEnviando"]
  setError: RegistroIntervencionState["setError"]
  setValidationErrors: RegistroIntervencionState["setValidationErrors"]
  validateForm: () => ValidationErrors
}

export function createSaveActions({
  medidaId,
  intervencionId,
  workflowPhase,
  queryClient,
  formData,
  intervencion,
  setIntervencion,
  setIsSaving,
  setIsEnviando,
  setError,
  setValidationErrors,
  validateForm,
}: SaveActionsParams) {
  /**
   * Create new intervención (BORRADOR)
   */
  const createNewIntervencion = async (): Promise<IntervencionResponse | null> => {
    // Validate required fields
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return null
    }

    setIsSaving(true)
    setError(null)
    setValidationErrors({})

    try {
      const payload: CreateIntervencionRequest = {
        medida: formData.medida,
        fecha_intervencion: formData.fecha_intervencion,
        tipo_dispositivo_id: formData.tipo_dispositivo_id || null,
        subtipo_dispositivo_id: formData.subtipo_dispositivo_id || null,
        motivo_id: formData.motivo_id!,
        sub_motivo_id: formData.sub_motivo_id || null,
        categoria_intervencion_id: formData.categoria_intervencion_id || null,
        intervencion_especifica: formData.intervencion_especifica,
        descripcion_detallada: formData.descripcion_detallada || null,
        motivo_vulneraciones: formData.motivo_vulneraciones || null,
        tipo_cese: formData.tipo_cese || null,
        subtipo_cese: formData.subtipo_cese || null,
        requiere_informes_ampliatorios: formData.requiere_informes_ampliatorios,
      }

      const data = await createIntervencion(medidaId, payload)
      setIntervencion(data)

      track(AnalyticsEvent.INTERVENCION_CREADA, {
        medida_id: medidaId,
        intervencion_id: data.id,
        workflow_phase: workflowPhase ?? null,
      })

      toast.success('Registro de Intervención creado exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Force immediate refetch to update UI
      try {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        logger.warn('[useRegistroIntervencion] Cache refetch failed (create):', refetchErr)
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return data
    } catch (err: any) {
      logger.error("Error creating intervención:", err)
      const errorMessage =
        err?.response?.data?.detail || "Error al crear la intervención"
      setError(errorMessage)

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
      })

      // Handle validation errors from backend
      if (err?.response?.data?.errors) {
        const backendErrors: ValidationErrors = {}
        err.response.data.errors.forEach((e: any) => {
          backendErrors[e.field] = e.message
        })
        setValidationErrors(backendErrors)
      }

      return null
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Update existing intervención
   */
  const updateExistingIntervencion = async (): Promise<IntervencionResponse | null> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("No se puede actualizar: ID de intervención no definido")
      return null
    }

    // Validate required fields
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return null
    }

    setIsSaving(true)
    setError(null)
    setValidationErrors({})

    try {
      const payload: UpdateIntervencionRequest = {
        fecha_intervencion: formData.fecha_intervencion,
        tipo_dispositivo_id: formData.tipo_dispositivo_id || null,
        subtipo_dispositivo_id: formData.subtipo_dispositivo_id || null,
        motivo_id: formData.motivo_id,
        sub_motivo_id: formData.sub_motivo_id || null,
        categoria_intervencion_id: formData.categoria_intervencion_id || null,
        intervencion_especifica: formData.intervencion_especifica,
        descripcion_detallada: formData.descripcion_detallada || null,
        motivo_vulneraciones: formData.motivo_vulneraciones || null,
        tipo_cese: formData.tipo_cese,
        subtipo_cese: formData.subtipo_cese,
        requiere_informes_ampliatorios: formData.requiere_informes_ampliatorios,
      }

      const data = await updateIntervencion(medidaId, effectiveId, payload)
      setIntervencion(data)

      toast.success('Registro de Intervención actualizado exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Force immediate refetch to update UI
      try {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        logger.warn('[useRegistroIntervencion] Cache refetch failed (update):', refetchErr)
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return data
    } catch (err: any) {
      logger.error("Error updating intervención:", err)
      const errorMessage =
        err?.response?.data?.detail || "Error al actualizar la intervención"
      setError(errorMessage)

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
      })

      // Handle validation errors from backend
      if (err?.response?.data?.errors) {
        const backendErrors: ValidationErrors = {}
        err.response.data.errors.forEach((e: any) => {
          backendErrors[e.field] = e.message
        })
        setValidationErrors(backendErrors)
      }

      return null
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Save intervención (create or update based on whether intervencionId exists)
   */
  const guardarBorrador = async (): Promise<IntervencionResponse | null> => {
    // Use prop intervencionId, or fallback to a just-created intervention's ID
    const effectiveId = intervencionId || intervencion?.id
    if (effectiveId) {
      return await updateExistingIntervencion()
    } else {
      return await createNewIntervencion()
    }
  }

  /**
   * Create AND send intervención in one operation
   * Uses the combined /crear-y-enviar/ endpoint for better UX
   *
   * @param archivos Optional files to attach during creation
   * @param tipos Optional file types (must match archivos length)
   * @returns The created intervention with workflow state, or null on error
   */
  const guardarYEnviar = async (
    archivos?: File[],
    tipos?: string[]
  ): Promise<CrearYEnviarResponse | null> => {
    // Validate required fields
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return null
    }

    setIsSaving(true)
    setIsEnviando(true)
    setError(null)
    setValidationErrors({})

    try {
      const payload: CrearYEnviarRequest = {
        fecha_intervencion: formData.fecha_intervencion,
        motivo_id: formData.motivo_id!,
        sub_motivo_id: formData.sub_motivo_id || null,
        categoria_intervencion_id: formData.categoria_intervencion_id || null,
        intervencion_especifica: formData.intervencion_especifica,
        descripcion_detallada: formData.descripcion_detallada || null,
        motivo_vulneraciones: formData.motivo_vulneraciones || null,
        tipo_dispositivo_id: formData.tipo_dispositivo_id || null,
        subtipo_dispositivo_id: formData.subtipo_dispositivo_id || null,
        tipo_cese: formData.tipo_cese || null,
        subtipo_cese: formData.subtipo_cese || null,
        requiere_informes_ampliatorios: formData.requiere_informes_ampliatorios,
      }

      const response = await crearYEnviarIntervencion(
        medidaId,
        payload,
        archivos,
        tipos
      )

      // Update local state with the created intervention
      setIntervencion(response)

      track(AnalyticsEvent.INTERVENCION_ENVIADA, {
        medida_id: medidaId,
        intervencion_id: (response as any)?.id ?? null,
        workflow_phase: workflowPhase ?? null,
        flujo: "crear_y_enviar",
      })

      // Update cache directly with response data, then refetch for full sync
      try {
        // If response contains medida with etapa_actual, update the cache directly
        const responseAny = response as any
        if (responseAny.medida?.etapa_actual) {
          queryClient.setQueryData(
            medidaKeys.detail(medidaId),
            (oldData: any) => {
              if (!oldData) return oldData
              logger.log('[guardarYEnviar] Updating cache with new etapa_actual:', responseAny.medida.etapa_actual)
              return {
                ...oldData,
                etapa_actual: responseAny.medida.etapa_actual,
                etapa_actual_detalle: responseAny.medida.etapa_actual,
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
        logger.warn('[useRegistroIntervencion] Cache update failed (guardarYEnviar):', refetchErr)
        // Fallback to invalidation if refetch fails
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return response
    } catch (err: any) {
      logger.error("Error creating and sending intervención:", err)
      const errorMessage =
        err?.response?.data?.detail || "Error al crear y enviar la intervención"
      setError(errorMessage)

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
      })

      // Handle validation errors from backend
      if (err?.response?.data?.errors) {
        const backendErrors: ValidationErrors = {}
        err.response.data.errors.forEach((e: any) => {
          backendErrors[e.field] = e.message
        })
        setValidationErrors(backendErrors)
      }

      return null
    } finally {
      setIsSaving(false)
      setIsEnviando(false)
    }
  }

  return {
    createNewIntervencion,
    updateExistingIntervencion,
    guardarBorrador,
    guardarYEnviar,
  }
}
