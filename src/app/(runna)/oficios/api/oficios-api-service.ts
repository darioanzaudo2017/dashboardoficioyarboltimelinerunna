import { get } from "@/app/api/apiService"
import type { DemandaAllItem } from "../types"

/**
 * Trae TODAS las demandas sin paginar. No tiene wrapper existente en el
 * frontend; se descubrió pegándole directo al backend (mismo patrón que
 * `medidas-all` y `persona`). Es la fuente del SAC/expediente/oficio web
 * real de cada oficio.
 */
export const getDemandasAll = async (): Promise<DemandaAllItem[]> => {
  return get<DemandaAllItem[]>("registro-demanda-form/")
}
