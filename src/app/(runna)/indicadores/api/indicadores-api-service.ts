/**
 * Servicio de datos para los indicadores SPPD (IP1-IP27).
 *
 * Descubrimiento: `GET /medidas-all/` y `GET /persona/` no tenían wrapper en
 * el frontend — se verificaron pegándole directamente al backend real.
 * Ambos devuelven un array plano SIN paginar (236 medidas / 295 personas en
 * la muestra usada para investigar), así que alcanza con una sola llamada a
 * cada uno para tener todo el dataset.
 */
import { get } from "@/app/api/apiService"
import type { MedidaAllItem, PersonaAllItem } from "../types"

export const getMedidasAll = async (): Promise<MedidaAllItem[]> => {
  return get<MedidaAllItem[]>("medidas-all/")
}

export const getPersonasAll = async (): Promise<PersonaAllItem[]> => {
  return get<PersonaAllItem[]>("persona/")
}
