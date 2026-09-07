/**
 * Helper canónico para mostrar el nombre de un usuario.
 *
 * Consolida dos implementaciones que eran equivalentes para sus call sites:
 * - `nota-aval-api.ts`      (aceptaba `string | DirectorInfo`)
 * - `ratificacion-judicial-api.ts` (aceptaba sólo `string | undefined`)
 *
 * El cuerpo es el de `nota-aval-api.ts`, que es el superconjunto: para toda
 * entrada `string | null | undefined` devuelve exactamente lo mismo que la
 * versión de `ratificacion-judicial-api.ts`, y esa versión no podía recibir
 * objetos.
 *
 * NO consolida la de `informe-juridico-api.ts`: esa variante omite el fallback
 * a `username` y el chequeo de `trim()`, así que difiere de forma observable
 * cuando `nombre_completo` llega vacío o en blanco. Ver
 * `claudedocs/CONSOLIDACION_FRONTEND_2026-09-07.md`.
 */

/**
 * Forma mínima que necesita `extractUserName` para resolver un nombre.
 * `DirectorInfo` y `EquipoLegalInfo` son estructuralmente compatibles.
 */
export interface UserNameSource {
  nombre_completo: string
  username?: string
}

export const extractUserName = (value: string | UserNameSource | undefined | null): string => {
  if (!value) return 'Usuario desconocido'
  if (typeof value === 'string') return value || 'Usuario desconocido'
  // Try nombre_completo first, then username, then fallback
  if (value.nombre_completo && value.nombre_completo.trim()) {
    return value.nombre_completo
  }
  if (value.username && value.username.trim()) {
    return value.username
  }
  return 'Usuario desconocido'
}
