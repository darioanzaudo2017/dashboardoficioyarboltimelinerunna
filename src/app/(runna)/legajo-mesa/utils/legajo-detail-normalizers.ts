import type {
  LegajoBasicInfo,
  LocalidadInfo,
  LocalizacionActual,
} from "../types/legajo-api"

/**
 * Normaliza la urgencia porque versiones anteriores del endpoint devolvían
 * el nombre como string y la versión actual devuelve un objeto o null.
 */
export const getUrgenciaNombre = (
  urgencia: LegajoBasicInfo["urgencia"]
): string | null => {
  if (typeof urgencia === "string") return urgencia || null
  return urgencia?.nombre || null
}

/**
 * Extrae la localización concreta del wrapper del detalle consolidado.
 * El fallback legacy permite abrir respuestas cacheadas con la forma anterior.
 */
export const unwrapLocalizacionActual = <T = LocalidadInfo>(
  localizacionActual: LocalizacionActual | null | undefined
): T | null => {
  const relacion = localizacionActual?.localizacion
  if (!relacion) return null

  if (
    typeof relacion === "object" &&
    "localizacion" in relacion &&
    relacion.localizacion
  ) {
    return relacion.localizacion as T
  }

  return relacion as unknown as T
}
