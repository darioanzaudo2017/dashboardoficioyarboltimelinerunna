import {
  getCategorias,
  getTiposDispositivo,
  getCategoriasIntervencion,
} from "../../../api/intervenciones-api-service"
import { logger } from "@/utils/logger"
import type {
  MotivoIntervencion,
  SubMotivoIntervencion,
} from "../../../types/intervencion-api"
import type { RegistroIntervencionState } from "../state/useRegistroIntervencionState"

interface CatalogActionsParams {
  setTiposDispositivo: RegistroIntervencionState["setTiposDispositivo"]
  setMotivos: RegistroIntervencionState["setMotivos"]
  setSubMotivos: RegistroIntervencionState["setSubMotivos"]
  setCategorias: RegistroIntervencionState["setCategorias"]
  setIsLoadingCatalogs: RegistroIntervencionState["setIsLoadingCatalogs"]
}

export function createCatalogActions({
  setTiposDispositivo,
  setMotivos,
  setSubMotivos,
  setCategorias,
  setIsLoadingCatalogs,
}: CatalogActionsParams) {
  // ============================================================================
  // API CALLS - CATALOGS
  // ============================================================================

  /**
   * Load all catalog data from API
   * Uses unified /api/categorias/ endpoint for motivos and submotivos
   */
  const loadCatalogs = async () => {
    setIsLoadingCatalogs(true)

    try {
      // Fetch all catalogs in parallel
      const [categoriasResponse, tiposDispositivoData, categoriasIntervencionData] = await Promise.all([
        getCategorias(),
        getTiposDispositivo(),
        getCategoriasIntervencion(),
      ])

      // Map categorias_motivo to MotivoIntervencion format
      const motivosData: MotivoIntervencion[] = categoriasResponse.categorias_motivo.map((motivo) => ({
        id: motivo.id,
        nombre: motivo.nombre,
        activo: true,
      }))

      // Map categorias_submotivo to SubMotivoIntervencion format
      const subMotivosData: SubMotivoIntervencion[] = categoriasResponse.categorias_submotivo.map((submotivo) => ({
        id: submotivo.id,
        motivo_id: submotivo.motivo, // Map 'motivo' to 'motivo_id'
        nombre: submotivo.nombre,
        activo: true,
      }))

      // Update state
      setTiposDispositivo(tiposDispositivoData)
      setMotivos(motivosData)
      setSubMotivos(subMotivosData)
      setCategorias(categoriasIntervencionData)

      logger.log("Catalogs loaded successfully:", {
        motivos: motivosData.length,
        subMotivos: subMotivosData.length,
        tiposDispositivo: tiposDispositivoData.length,
        categorias: categoriasIntervencionData.length,
      })
    } catch (err: any) {
      logger.error("Error loading catalogs:", err)
      // Don't set global error for catalog loading failure
      // Keep empty arrays so the UI can still render
    } finally {
      setIsLoadingCatalogs(false)
    }
  }

  return { loadCatalogs }
}
