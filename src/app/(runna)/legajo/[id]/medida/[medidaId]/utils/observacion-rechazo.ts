import type { EstadoIntervencion } from "../types/intervencion-api"

interface IntervencionConObservacion {
  estado?: EstadoIntervencion | string | null
  observaciones_jz?: string | null
}

/**
 * Observación que dejó el Jefe Zonal al rechazar una intervención, para mostrársela al técnico.
 * Solo corresponde mientras la intervención está de vuelta en manos del técnico (rechazada o guardada
 * como borrador después del rechazo): una vez reenviada o aprobada, la observación vieja ya no aplica.
 */
export const observacionDeRechazo = (intervencion?: IntervencionConObservacion | null): string | null => {
  if (!intervencion) return null
  if (intervencion.estado !== "RECHAZADO" && intervencion.estado !== "BORRADOR") return null
  const texto = intervencion.observaciones_jz?.trim()
  return texto ? texto : null
}
