// Los códigos no llevan tildes; se restauran en las palabras que aparecen en los estados.
const CON_TILDE: Record<string, string> = {
  intervencion: "intervención",
  aprobacion: "aprobación",
  ratificacion: "ratificación",
  juridico: "jurídico",
  revision: "revisión",
  redaccion: "redacción",
  innovacion: "innovación",
  prorroga: "prórroga",
}

/**
 * Texto para mostrar de un estado de etapa. Si el servidor ya manda el nombre (`nombre_display`) se usa tal cual;
 * si solo hay el código (`PENDIENTE_REGISTRO_INTERVENCION`) se convierte en una frase legible.
 */
export const estadoLegible = (codigo?: string | null, display?: string | null): string => {
  const nombre = display?.trim()
  if (nombre) return nombre
  const limpio = (codigo ?? "").trim()
  if (!limpio) return ""
  const frase = limpio
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/[a-z]+/g, (palabra) => CON_TILDE[palabra] ?? palabra)
  return frase.charAt(0).toUpperCase() + frase.slice(1)
}
