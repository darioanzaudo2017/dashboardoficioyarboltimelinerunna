import {
  uploadAdjunto,
  getAdjuntos,
  deleteAdjunto,
} from "../../../api/intervenciones-api-service"
import { logger } from "@/utils/logger"
import { describeApiError } from "@/utils/apiErrorFormatter"
import { showErrorToast } from "@/utils/showErrorToast"

/** Aviso para el usuario cuando falla una operación con archivos. Un 500 trae una página HTML: no se muestra tal cual. */
const avisarErrorDeArchivo = (err: any, titulo: string) => {
  const { message, details } = describeApiError(err, titulo)
  const status = err?.response?.status
  if (status >= 500) {
    showErrorToast(
      `${titulo} el servidor tuvo un problema (error ${status}). Probá de nuevo en unos minutos; si sigue, avisá al equipo técnico.`,
      details
    )
    return
  }
  showErrorToast(message, details)
}
import type { AdjuntoIntervencion } from "../../../types/intervencion-api"
import type { RegistroIntervencionState } from "../state/useRegistroIntervencionState"

interface AdjuntosActionsParams {
  medidaId: number
  intervencionId?: number
  intervencion: RegistroIntervencionState["intervencion"]
  setAdjuntos: RegistroIntervencionState["setAdjuntos"]
  setIsLoadingAdjuntos: RegistroIntervencionState["setIsLoadingAdjuntos"]
  setIsUploadingAdjunto: RegistroIntervencionState["setIsUploadingAdjunto"]
  setError: RegistroIntervencionState["setError"]
}

export function createAdjuntosActions({
  medidaId,
  intervencionId,
  intervencion,
  setAdjuntos,
  setIsLoadingAdjuntos,
  setIsUploadingAdjunto,
  setError,
}: AdjuntosActionsParams) {
  // ============================================================================
  // API CALLS - ADJUNTOS
  // ============================================================================

  /**
   * Load adjuntos list
   */
  const loadAdjuntos = async () => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) return


    setIsLoadingAdjuntos(true)

    try {
      const data = await getAdjuntos(medidaId, effectiveId)
      setAdjuntos(data)
    } catch (err: any) {
      logger.error("Error loading adjuntos:", err)
      // Check for permission errors (Legal users might be blocked from this specific endpoint)
      if (err?.response?.status === 404 || err?.response?.status === 403) {
        logger.warn("[useRegistroIntervencion] Specific adjuntos-list endpoint blocked, falling back to nested data")
      }
    } finally {
      setIsLoadingAdjuntos(false)
    }
  }

  /**
   * Upload adjunto
   */
  const uploadAdjuntoFile = async (
    file: File,
    tipo: string
  ): Promise<AdjuntoIntervencion | null> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("Debe guardar la intervención antes de subir adjuntos")
      return null
    }

    setIsUploadingAdjunto(true)
    setError(null)

    try {
      const adjunto = await uploadAdjunto(medidaId, effectiveId, file, tipo)
      // Reload adjuntos list
      await loadAdjuntos()
      return adjunto
    } catch (err: any) {
      logger.error("Error uploading adjunto:", err)
      setError(err?.response?.data?.detail || "Error al subir el archivo")
      // El paso de documentos no muestra `error`: sin este aviso el archivo "no se adjunta" y no se sabe por qué.
      avisarErrorDeArchivo(err, "No se pudo adjuntar el archivo:")
      return null
    } finally {
      setIsUploadingAdjunto(false)
    }
  }

  /**
   * Delete adjunto
   */
  const deleteAdjuntoFile = async (adjuntoId: number): Promise<boolean> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) return false

    try {
      await deleteAdjunto(medidaId, effectiveId, adjuntoId)
      // Reload adjuntos list
      await loadAdjuntos()
      return true
    } catch (err: any) {
      logger.error("Error deleting adjunto:", err)
      setError(err?.response?.data?.detail || "Error al eliminar el archivo")
      avisarErrorDeArchivo(err, "No se pudo quitar el archivo:")
      return false
    }
  }

  return { loadAdjuntos, uploadAdjuntoFile, deleteAdjuntoFile }
}
