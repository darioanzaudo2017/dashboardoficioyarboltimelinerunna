/** Formato de fecha corto en español usado por la tabla y las tarjetas. */
export const formatDate = (fecha: string | null | undefined) => {
  if (!fecha) return "N/A"
  try {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return fecha
  }
}
