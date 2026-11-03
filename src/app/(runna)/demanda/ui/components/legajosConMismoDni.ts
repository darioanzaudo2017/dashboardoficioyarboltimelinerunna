/**
 * Entre los resultados de una búsqueda de legajos, marca los que comparten DNI con otro legajo del resultado.
 * Un mismo niño/a con dos legajos genera medidas vigentes duplicadas, así que conviene avisar antes de vincular uno de ellos.
 */
export const dnisRepetidos = (legajos: { dni?: number | string | null }[]): Set<string> => {
  const cuenta = new Map<string, number>()
  legajos.forEach(({ dni }) => {
    if (dni === null || dni === undefined || String(dni).trim() === "") return
    const clave = String(dni).trim()
    cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1)
  })
  return new Set([...cuenta.entries()].filter(([, veces]) => veces > 1).map(([dni]) => dni))
}
