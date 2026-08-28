export interface ItemDesglose {
  label: string
  value: number
}

/**
 * Cuenta ocurrencias de `selector(item)` sobre una lista, agrupando
 * null/undefined/"" bajo "Sin dato". Si se pasa `orden`, respeta ese orden
 * (útil para grupos etarios/duración); si no, ordena de mayor a menor.
 */
export function contarPor<T>(
  lista: T[],
  selector: (item: T) => string | null | undefined,
  orden?: string[]
): ItemDesglose[] {
  const conteo = new Map<string, number>()
  for (const item of lista) {
    const valor = selector(item)
    const label = valor && valor.trim() !== "" ? valor : "Sin dato"
    conteo.set(label, (conteo.get(label) ?? 0) + 1)
  }

  if (orden) {
    return orden.filter((label) => conteo.has(label)).map((label) => ({ label, value: conteo.get(label)! }))
  }

  return Array.from(conteo.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

/** Total de una lista, atajo para no repetir `.length` con nombre poco claro en los indicadores. */
export function total<T>(lista: T[]): number {
  return lista.length
}

/** Cuenta valores ÚNICOS de `selector(item)` (para "cantidad de NNyA" en vez de "cantidad de medidas"). */
export function contarUnicos<T>(lista: T[], selector: (item: T) => number | string | null | undefined): number {
  const set = new Set<number | string>()
  for (const item of lista) {
    const valor = selector(item)
    if (valor !== null && valor !== undefined) set.add(valor)
  }
  return set.size
}

/**
 * Deduplica una lista de medidas por NNyA (un mismo NNyA puede tener varias
 * medidas — para "cantidad de NNyA" hay que contarlo una sola vez). Se queda
 * con la primera ocurrencia. Medidas sin nnyaId (dato faltante) se incluyen
 * igual, sin deduplicar, para no perderlas silenciosamente.
 */
export function porNnyaUnico<T extends { nnyaId: number | null }>(lista: T[]): T[] {
  const vistos = new Set<number>()
  const resultado: T[] = []
  for (const item of lista) {
    if (item.nnyaId === null) {
      resultado.push(item)
      continue
    }
    if (vistos.has(item.nnyaId)) continue
    vistos.add(item.nnyaId)
    resultado.push(item)
  }
  return resultado
}
