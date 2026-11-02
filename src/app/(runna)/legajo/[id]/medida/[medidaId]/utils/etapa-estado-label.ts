/**
 * Etiqueta del estado de una etapa tal como llega en `historial_etapas`.
 *
 * `estado_display` sale de las choices del modelo, que no incluyen los estados
 * de la MPI (`PENDIENTE_DE_INFORME_DE_CIERRE`, `INFORME_DE_CIERRE_REDACTADO`):
 * para esos el back devuelve el código crudo. El catálogo (`estado_especifico`)
 * sí trae su `nombre_display`, así que se usa ese primero.
 */
export interface EtapaEstadoLike {
  estado?: string | null
  estado_display?: string | null
  estado_especifico?: number | { nombre_display?: string | null } | null
}

const ES_CODIGO = /^[A-Z0-9_]+$/

export function getEtapaEstadoLabel(etapa: EtapaEstadoLike | null | undefined): string | undefined {
  if (!etapa) return undefined
  const catalogo = etapa.estado_especifico
  if (catalogo && typeof catalogo === "object" && catalogo.nombre_display) return catalogo.nombre_display
  const display = etapa.estado_display
  if (display && display !== etapa.estado && !ES_CODIGO.test(display)) return display
  return undefined
}
