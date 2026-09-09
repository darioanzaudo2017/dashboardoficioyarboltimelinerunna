"use client"

import { useUser } from "@/utils/auth/userZustand"
import { useUserPermissions } from "../../../../legajo-mesa/hooks/useUserPermissions"

/**
 * Quien conserva la personalizacion de la bandeja de mesa de entradas.
 *
 * Pedido de UX: la vista tiene que ser la misma para todos (constancia en el uso
 * y menos objetos en pantalla), y solo los usuarios con funciones especificas
 * mantienen la posibilidad de personalizarla. Roles habilitados: jefe zonal,
 * director y admin.
 *
 * Se reusa `useUserPermissions` -el mismo hook que ya resuelve roles en la
 * bandeja de legajos- para no tener dos lecturas distintas de los grupos del
 * usuario. Se le suma el flag por zona (`zonas[].jefe` / `zonas[].director`)
 * porque DemandaTableContent ya trata esas zonas como direccion para el permiso
 * de calificar (GAP-18) y hay jefes/directores cargados solo asi, sin grupo:
 * sin esto se les sacaria la personalizacion a usuarios que si deben tenerla.
 */
export const useCanCustomizeView = (): boolean => {
  const { isAdmin, isJefeZonal, isDirector } = useUserPermissions()
  const user = useUser((state) => state.user)

  const tieneZonaACargo = user?.zonas?.some((zona) => zona.jefe || zona.director) ?? false

  return isAdmin || isJefeZonal || isDirector || tieneZonaACargo
}
