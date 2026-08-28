import type { MedidaEnriquecida } from "./enriquecer"

export interface PuntoSerieVigentes {
  mes: string // "YYYY-MM"
  MPI: number
  MPE: number
  MPJ: number
}

/**
 * "Medidas vigentes a fin de cada mes" — no es un conteo por evento
 * (apertura +1 / cierre -1), sino una foto directa mes a mes: para cada fin
 * de mes, cuántas medidas de cada tipo tenían fecha_apertura <= ese mes Y
 * (sin fecha_cierre O fecha_cierre posterior a ese mes). Esto es más robusto
 * que sumar deltas si hay algún dato de fecha inconsistente.
 *
 * Usa SIEMPRE el dataset completo (no el filtrado por período de la página),
 * porque una medida abierta antes del filtro pero aún vigente durante la
 * ventana igual debe contar como vigente en esos meses.
 */
export function calcularSerieVigentes(medidas: MedidaEnriquecida[]): PuntoSerieVigentes[] {
  if (medidas.length === 0) return []

  const fechasApertura = medidas
    .map((m) => new Date(m.fechaApertura).getTime())
    .filter((t) => !Number.isNaN(t))
  if (fechasApertura.length === 0) return []

  const inicio = new Date(Math.min(...fechasApertura))
  const hoy = new Date()

  const meses: { year: number; month: number; label: string }[] = []
  const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  const limite = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  while (cursor <= limite) {
    meses.push({
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      label: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return meses.map(({ year, month, label }) => {
    const finDeMes = new Date(year, month + 1, 0, 23, 59, 59)

    const contarTipo = (tipo: "MPI" | "MPE" | "MPJ") =>
      medidas.filter((m) => {
        if (m.tipoMedida !== tipo) return false
        const apertura = new Date(m.fechaApertura)
        if (apertura > finDeMes) return false
        if (!m.fechaCierre) return true
        return new Date(m.fechaCierre) > finDeMes
      }).length

    return { mes: label, MPI: contarTipo("MPI"), MPE: contarTipo("MPE"), MPJ: contarTipo("MPJ") }
  })
}
