/**
 * El backend describe cada coincidencia con frases como
 *   "...match en el campo 'calle' (Colon) y 'localidad' (CORDOBA); vinculado a la demanda 323"
 * pero en ese momento no se vinculó nada: es sólo una coincidencia. Se reescribe el cierre
 * para no inducir a error.
 */
export const normalizeMatchDescription = (description: string): string =>
  description.replace(/;?\s*vinculad[oa] a la demanda\s+(\d+)/i, "; coincide con la demanda #$1")
