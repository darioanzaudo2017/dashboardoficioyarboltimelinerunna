/**
 * Servicio de datos para los indicadores SPPD (IP1-IP27).
 *
 * El backend expone los datos demográficos del NNyA dentro de cada medida y
 * permite omitir el detalle de actividades, por lo que el tablero se resuelve
 * con una sola llamada liviana.
 */
import { get } from "@/app/api/apiService"
import type { MedidaAllItem } from "../types"

export const getMedidasAll = async (): Promise<MedidaAllItem[]> => {
  return get<MedidaAllItem[]>("medidas-all/", { include_actividades: false })
}
