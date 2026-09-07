import {
  getIntervencionDetail,
  getIntervencionesByMedida,
} from "../../../api/intervenciones-api-service"
import { logger } from "@/utils/logger"
import type { RegistroIntervencionState } from "../state/useRegistroIntervencionState"

interface LoadActionsParams {
  medidaId: number
  intervencionId?: number
  setIntervencion: RegistroIntervencionState["setIntervencion"]
  setFormData: RegistroIntervencionState["setFormData"]
  setIsLoading: RegistroIntervencionState["setIsLoading"]
  setError: RegistroIntervencionState["setError"]
}

export function createLoadActions({
  medidaId,
  intervencionId,
  setIntervencion,
  setFormData,
  setIsLoading,
  setError,
}: LoadActionsParams) {
  // ============================================================================
  // API CALLS - CRUD
  // ============================================================================

  /**
   * Load intervención detail from API
   */
  const loadIntervencion = async () => {
    if (!intervencionId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await getIntervencionDetail(medidaId, intervencionId)
      setIntervencion(data)

      // Populate form data with loaded intervención
      // Extract IDs from detail objects as fallback (API returns *_detalle with nested id)
      setFormData({
        medida: data.medida,
        fecha_intervencion: data.fecha_intervencion,
        tipo_dispositivo_id: data.tipo_dispositivo_id ?? data.tipo_dispositivo_detalle?.id ?? null,
        subtipo_dispositivo_id: data.subtipo_dispositivo_id ?? data.subtipo_dispositivo_detalle?.id ?? null,
        motivo_id: data.motivo_id ?? data.motivo_detalle?.id,
        sub_motivo_id: data.sub_motivo_id ?? data.sub_motivo_detalle?.id ?? null,
        categoria_intervencion_id: data.categoria_intervencion_id ?? data.categoria_intervencion_detalle?.id,
        intervencion_especifica: data.intervencion_especifica,
        descripcion_detallada: data.descripcion_detallada || "",
        motivo_vulneraciones: data.motivo_vulneraciones || "",
        tipo_cese: data.tipo_cese || null,
        subtipo_cese: data.subtipo_cese || null,
        requiere_informes_ampliatorios: data.requiere_informes_ampliatorios,
      })

    } catch (err: any) {
      logger.error("Error loading intervención:", err)
      setError(err?.response?.data?.detail || "Error al cargar la intervención")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Load aperture data to pre-fill cese fields
   */
  const loadAperturaData = async () => {
    if (!medidaId) return

    setIsLoading(true)
    try {
      // Fetch all interventions for this measure
      const intervenciones = await getIntervencionesByMedida(medidaId)

      // Find the "Apertura" (usually the oldest one or the first one created)
      // For now we assume the first one in the list (or we could sort by date)
      if (intervenciones.length > 0) {
        // Find by category or just pick the first one if we can't be sure
        const apertura = intervenciones.find(i => i.categoria_intervencion_detalle?.nombre.toUpperCase().includes('APERTURA'))
          || intervenciones[0]

        if (apertura) {
          logger.log("Pre-filling from apertura:", apertura)
          setFormData(prev => ({
            ...prev,
            motivo_id: apertura.motivo_id ?? apertura.motivo_detalle?.id,
            sub_motivo_id: apertura.sub_motivo_id ?? apertura.sub_motivo_detalle?.id,
            categoria_intervencion_id: apertura.categoria_intervencion_id ?? apertura.categoria_intervencion_detalle?.id,
          }))
        }
      }
    } catch (err) {
      logger.error("Error loading aperture data for pre-fill:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return { loadIntervencion, loadAperturaData }
}
