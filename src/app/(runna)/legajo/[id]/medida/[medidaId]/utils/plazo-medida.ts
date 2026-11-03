/** Plazo legal de una medida MPE, en días corridos desde su creación. */
export const PLAZO_MPE_DIAS = 90

export type EstadoPlazo = "normal" | "warning" | "critical" | "exceeded"

export interface PlazoMedida {
  diasTranscurridos: number
  diasRestantes: number
  /** 0 a 100 */
  porcentaje: number
  estado: EstadoPlazo
}

const SOLO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/

/** Una fecha sin hora ("2026-10-27") es un día de calendario: se arma en hora local para que no se corra al día anterior. */
const aFecha = (valor: string): Date => {
  const m = SOLO_FECHA.exec(valor)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(valor)
}

const inicioDelDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/**
 * Días que pasaron desde `fechaCreacion` y cuántos quedan del plazo. Mismos cortes que la vista clásica:
 * 30 días o menos = atención, 15 o menos = crítico, 100% = vencido. Devuelve null si la fecha no sirve.
 */
export const calcularPlazoMedida = (
  fechaCreacion: string | null | undefined,
  hoy: Date = new Date(),
  maxDias: number = PLAZO_MPE_DIAS,
): PlazoMedida | null => {
  if (!fechaCreacion) return null
  const creacion = aFecha(fechaCreacion)
  if (Number.isNaN(creacion.getTime())) return null

  const diasTranscurridos = Math.max(Math.floor((inicioDelDia(hoy) - inicioDelDia(creacion)) / 86_400_000), 0)
  const diasRestantes = Math.max(maxDias - diasTranscurridos, 0)
  const porcentaje = Math.min((diasTranscurridos / maxDias) * 100, 100)

  let estado: EstadoPlazo = "normal"
  if (porcentaje >= 100) estado = "exceeded"
  else if (diasRestantes <= 15) estado = "critical"
  else if (diasRestantes <= 30) estado = "warning"

  return { diasTranscurridos, diasRestantes, porcentaje, estado }
}
