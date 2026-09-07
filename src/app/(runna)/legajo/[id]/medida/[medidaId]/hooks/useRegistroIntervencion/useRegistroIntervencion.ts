/**
 * Custom Hook for Registro de Intervención
 * Manages state, API calls, and business logic for intervención registration
 *
 * MED-02: Registro de Intervención
 */

import { useEffect, useCallback } from "react"
import { useQueryClient } from '@tanstack/react-query'
import { getCurrentDateISO } from "@/utils/dateUtils"
import { useRegistroIntervencionState } from "./state/useRegistroIntervencionState"
import { createFormValidation } from "./validation/createFormValidation"
import { createLoadActions } from "./actions/createLoadActions"
import { createSaveActions } from "./actions/createSaveActions"
import { createWorkflowActions } from "./actions/createWorkflowActions"
import { createAdjuntosActions } from "./actions/createAdjuntosActions"
import { createCatalogActions } from "./actions/createCatalogActions"
import type { EstadoIntervencion } from "../../types/intervencion-api"
import type { IntervencionFormData, UseRegistroIntervencionOptions } from "./types"

// ============================================================================
// HOOK
// ============================================================================

export const useRegistroIntervencion = ({
  medidaId,
  intervencionId,
  autoLoadCatalogs = true,
  workflowPhase,
  tipoMedida,
}: UseRegistroIntervencionOptions) => {
  // Query client for cache invalidation
  const queryClient = useQueryClient()

  // ----------------------------------------------------------------------------
  // STATE
  // ----------------------------------------------------------------------------
  const {
    formData,
    setFormData,
    intervencion,
    setIntervencion,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    isEnviando,
    setIsEnviando,
    isAprobando,
    setIsAprobando,
    isRechazando,
    setIsRechazando,
    isUploadingAdjunto,
    setIsUploadingAdjunto,
    isLoadingCatalogs,
    setIsLoadingCatalogs,
    error,
    setError,
    validationErrors,
    setValidationErrors,
    tiposDispositivo,
    setTiposDispositivo,
    motivos,
    setMotivos,
    subMotivos,
    setSubMotivos,
    categorias,
    setCategorias,
    adjuntos,
    setAdjuntos,
    isLoadingAdjuntos,
    setIsLoadingAdjuntos,
  } = useRegistroIntervencionState(medidaId)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load intervención detail if intervencionId is provided
   */
  useEffect(() => {
    if (intervencionId) {
      loadIntervencion()
    } else if (workflowPhase === 'cese' && medidaId) {
      loadAperturaData()
    }
  }, [intervencionId, workflowPhase, medidaId])

  /**
   * Load catalogs on mount if autoLoadCatalogs is true
   */
  useEffect(() => {
    if (autoLoadCatalogs) {
      loadCatalogs()
    }
  }, [autoLoadCatalogs])

  /**
   * Load adjuntos when intervención is loaded
   */
  useEffect(() => {
    if (intervencion?.id) {
      loadAdjuntos()
    }
  }, [intervencion?.id])

  /**
   * Filter sub-motivos when motivo changes
   */
  useEffect(() => {
    if (formData.motivo_id) {
      // Filter sub-motivos by selected motivo
      // In a real app, this might trigger an API call to get sub-motivos for this motivo
      // For now, we just filter the existing list
      const filtered = subMotivos.filter(
        (sm) => sm.motivo_id === formData.motivo_id
      )
      // If current sub_motivo is not in the filtered list, clear it
      if (
        formData.sub_motivo_id &&
        !filtered.find((sm) => sm.id === formData.sub_motivo_id)
      ) {
        setFormData((prev) => ({ ...prev, sub_motivo_id: null }))
      }
    }
  }, [formData.motivo_id, subMotivos])

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const { validateForm, isFormValid } = createFormValidation({
    formData,
    workflowPhase,
    tipoMedida,
    tiposDispositivo,
  })

  // ============================================================================
  // API CALLS - CRUD
  // ============================================================================

  const { loadIntervencion, loadAperturaData } = createLoadActions({
    medidaId,
    intervencionId,
    setIntervencion,
    setFormData,
    setIsLoading,
    setError,
  })

  const { guardarBorrador, guardarYEnviar } = createSaveActions({
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
  })

  // ============================================================================
  // API CALLS - STATE TRANSITIONS
  // ============================================================================

  const { enviar, aprobar, rechazar } = createWorkflowActions({
    medidaId,
    intervencionId,
    queryClient,
    intervencion,
    setIntervencion,
    setIsEnviando,
    setIsAprobando,
    setIsRechazando,
    setError,
  })

  // ============================================================================
  // API CALLS - ADJUNTOS
  // ============================================================================

  const { loadAdjuntos, uploadAdjuntoFile, deleteAdjuntoFile } = createAdjuntosActions({
    medidaId,
    intervencionId,
    intervencion,
    setAdjuntos,
    setIsLoadingAdjuntos,
    setIsUploadingAdjunto,
    setError,
  })

  // ============================================================================
  // API CALLS - CATALOGS
  // ============================================================================

  const { loadCatalogs } = createCatalogActions({
    setTiposDispositivo,
    setMotivos,
    setSubMotivos,
    setCategorias,
    setIsLoadingCatalogs,
  })

  // ============================================================================
  // FORM HELPERS
  // ============================================================================

  /**
   * Update a single form field
   */
  const updateField = useCallback(
    <K extends keyof IntervencionFormData>(
      field: K,
      value: IntervencionFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear validation error for this field when it changes
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [validationErrors]
  )

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      medida: medidaId,
      fecha_intervencion: getCurrentDateISO(),
      tipo_dispositivo_id: null,
      subtipo_dispositivo_id: null,
      motivo_id: undefined,
      sub_motivo_id: null,
      categoria_intervencion_id: undefined,
      intervencion_especifica: "",
      descripcion_detallada: "",
      motivo_vulneraciones: "",
      tipo_cese: null,
      subtipo_cese: null,
      requiere_informes_ampliatorios: false,
    })
    setValidationErrors({})
    setError(null)
  }

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setError(null)
    setValidationErrors({})
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Get filtered sub-motivos for current motivo
   */
  const availableSubMotivos = subMotivos.filter(
    (sm) => sm.motivo_id === formData.motivo_id
  )

  /**
   * Current estado of intervención
   */
  const currentEstado: EstadoIntervencion | null = intervencion?.estado || null

  /**
   * Check if intervención can be edited
   * BORRADOR and RECHAZADO can be edited
   */
  const canEdit = !intervencion || intervencion.estado === "BORRADOR" || intervencion.estado === "RECHAZADO"

  /**
   * Check if intervención can be sent
   * BORRADOR and RECHAZADO can be sent (re-sent after corrections)
   */
  const canEnviar = intervencion?.estado === "BORRADOR" || intervencion?.estado === "RECHAZADO"

  /**
   * Check if intervención can be approved/rejected
   * Only ENVIADO can be approved/rejected
   */
  const canAprobarOrRechazar = intervencion?.estado === "ENVIADO"

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // Form data
    formData,
    updateField,
    resetForm,

    // Current intervención
    intervencion,
    currentEstado,

    // Loading states
    isLoading,
    isSaving,
    isEnviando,
    isAprobando,
    isRechazando,
    isUploadingAdjunto,
    isLoadingAdjuntos,
    isLoadingCatalogs,

    // Error states
    error,
    validationErrors,
    clearErrors,

    // Validation
    validateForm,
    isFormValid,

    // CRUD operations
    guardarBorrador,
    guardarYEnviar,
    loadIntervencion,

    // State transitions
    enviar,
    aprobar,
    rechazar,

    // Adjuntos
    adjuntos,
    loadAdjuntos,
    uploadAdjuntoFile,
    deleteAdjuntoFile,

    // Catalogs
    tiposDispositivo,
    motivos,
    subMotivos: availableSubMotivos,
    categorias,
    loadCatalogs,

    // Permission checks
    canEdit,
    canEnviar,
    canAprobarOrRechazar,
  }
}
