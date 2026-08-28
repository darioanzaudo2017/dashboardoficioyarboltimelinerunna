/**
 * Cálculo de edad y grupos etarios. No existía un helper centralizado para
 * esto en el resto del código (el backend da `edad_calculada`/`edad_aproximada`
 * ya resueltos "a hoy", pero para los indicadores conviene la edad AL MOMENTO
 * de apertura de la medida, no la de hoy).
 */

export function calcularEdadEn(fechaNacimientoISO: string, fechaReferenciaISO: string): number {
  const nacimiento = new Date(fechaNacimientoISO)
  const referencia = new Date(fechaReferenciaISO)
  let edad = referencia.getFullYear() - nacimiento.getFullYear()
  const aunNoCumplio =
    referencia.getMonth() < nacimiento.getMonth() ||
    (referencia.getMonth() === nacimiento.getMonth() && referencia.getDate() < nacimiento.getDate())
  if (aunNoCumplio) edad -= 1
  return Math.max(edad, 0)
}

/**
 * Grupos etarios "razonables" para protección de derechos (no hay cortes
 * oficiales definidos en el código ni provistos por el usuario) — fácil de
 * ajustar acá si aparecen los cortes oficiales de la planilla SPPD.
 */
export function grupoEtario(edad: number | null): string {
  if (edad === null || Number.isNaN(edad)) return "Sin dato"
  if (edad <= 5) return "0 a 5 años"
  if (edad <= 12) return "6 a 12 años"
  if (edad <= 17) return "13 a 17 años"
  return "18 años o más"
}

export const ORDEN_GRUPOS_ETARIOS = ["0 a 5 años", "6 a 12 años", "13 a 17 años", "18 años o más", "Sin dato"]

/** Buckets de duración (en días) reusados por los indicadores de duración de medida. */
export function grupoDuracion(dias: number | null): string {
  if (dias === null || Number.isNaN(dias)) return "Sin dato"
  if (dias <= 30) return "Hasta 30 días"
  if (dias <= 90) return "31 a 90 días"
  if (dias <= 180) return "91 a 180 días"
  if (dias <= 365) return "181 a 365 días"
  return "Más de 365 días"
}

export const ORDEN_GRUPOS_DURACION = [
  "Hasta 30 días",
  "31 a 90 días",
  "91 a 180 días",
  "181 a 365 días",
  "Más de 365 días",
  "Sin dato",
]
