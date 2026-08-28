/**
 * `GET /registro-demanda-form/` es OTRO endpoint "bulk": ignora los query
 * params (probados `numero_expediente`, `search` — ninguno filtra) y siempre
 * devuelve el array completo sin paginar (287 demandas en la muestra usada
 * para investigar). Es la única fuente donde viven el SAC/expediente/oficio
 * web REALES de un oficio — `oficio_origen.numero` (embebido en la actividad
 * dentro de `medidas-all`) siempre viene null, no sirve para buscar.
 */
export interface DemandaAllItem {
  id: number
  numero_expediente: string | null
  nro_oficio_web: string | null
  nro_sac: string | number | null
  objetivo_de_demanda: string | null
}
