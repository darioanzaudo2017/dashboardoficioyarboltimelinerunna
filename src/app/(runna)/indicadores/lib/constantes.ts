/** Orden fijo de género — determina el color de cada categoría en toda la página, no solo el orden de aparición. */
export const ORDEN_GENERO = ["MASCULINO", "FEMENINO", "NO_BINARIO", "AUTOPERCIBIDO", "OTRO", "Sin dato"]

export const ORDEN_TIPO_MEDIDA = ["MPI", "MPE", "MPJ"]

/**
 * Etiqueta de "disponibilidad de DNI" (IP2). Centralizada acá porque la usan
 * tanto la tarjeta en pantalla como la exportación a Excel, y tienen que dar
 * exactamente las mismas categorías.
 */
export function etiquetaDisponibilidadDni(tieneDni: boolean | null): string {
  if (tieneDni === null) return "Sin dato"
  return tieneDni ? "Con DNI" : "Sin DNI"
}
