import { toDateObject } from "@/utils/dateUtils"

/**
 * Formato de fecha corto en español usado por la tabla y las tarjetas.
 * Una fecha sin hora ("2026-11-03") es un día de calendario: se arma con la hora local para que no se corra al día anterior.
 */
export const formatDate = (fecha: string | null | undefined) => {
  if (!fecha) return "N/A"
  try {
    return toDateObject(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return fecha
  }
}
