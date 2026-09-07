/**
 * Helpers de formato de fecha del tab de Seguimiento en Dispositivo (MPJ).
 *
 * En el archivo original estaban definidos TRES veces, uno dentro de cada
 * sección, con cuerpos byte a byte idénticos (verificado con `diff`). Se
 * extraen acá para no triplicarlos en los tres módulos nuevos.
 */

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
