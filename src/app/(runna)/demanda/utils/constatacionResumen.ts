/**
 * Ayudas para mostrar cuánto se cargó durante la Constatación (actividades y respuestas) en las pestañas
 * y en la confirmación de "Enviar a Evaluación". Son informativas: no condicionan el envío.
 */

/** Cantidad de elementos de una respuesta de lista (arreglo o paginada); `null` si todavía no se cargó. */
export const countItems = (data: unknown): number | null => {
  if (data === undefined || data === null) return null
  if (Array.isArray(data)) return data.length
  if (typeof data === "object") {
    const { count, results } = data as { count?: unknown; results?: unknown }
    if (typeof count === "number") return count
    if (Array.isArray(results)) return results.length
  }
  return null
}

/** "Registrar Actividad (3)"; sin número mientras los datos no cargaron. */
export const tabLabelWithCount = (label: string, count: number | null): string =>
  count === null ? label : `${label} (${count})`

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

/** "2 actividades registradas y 1 respuesta enviada". */
export const describeConstatacion = (actividades: number, respuestas: number): string =>
  `${plural(actividades, "actividad registrada", "actividades registradas")} y ${plural(
    respuestas,
    "respuesta enviada",
    "respuestas enviadas",
  )}`
