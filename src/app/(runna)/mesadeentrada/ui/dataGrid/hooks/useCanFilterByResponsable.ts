"use client"

import { useUser } from "@/utils/auth/userZustand"
import { useUserPermissions } from "../../../../legajo-mesa/hooks/useUserPermissions"

/**
 * Quien ve el selector de responsable de la bandeja de mesa de entradas.
 *
 * "Mis demandas" lo usa todo el mundo; elegir a *otra* persona como responsable
 * solo tiene sentido para quien conduce un equipo: jefe zonal, director y admin.
 * Para un tecnico el selector seria ruido -el backend acota por alcance de
 * zona/rol, asi que filtrar por un companero le devolveria una bandeja vacia-.
 *
 * Reusa `useUserPermissions` (el mismo hook de roles que la bandeja de legajos y
 * `useCanCustomizeView`) y le suma el flag por zona `zonas[].jefe` /
 * `zonas[].director` por el mismo motivo que documenta `useCanCustomizeView`:
 * hay jefes y directores cargados solo por zona, sin grupo, y sin ese chequeo se
 * quedarian sin el selector.
 *
 * Es una decision de UI, no un control de acceso: el filtro solo *acota* lo que
 * el usuario ya podia ver, nunca lo amplia, y el backend sigue siendo la
 * autoridad sobre el alcance.
 */
export const useCanFilterByResponsable = (): boolean => {
  const { isAdmin, isJefeZonal, isDirector } = useUserPermissions()
  const user = useUser((state) => state.user)

  const tieneZonaACargo = user?.zonas?.some((zona) => zona.jefe || zona.director) ?? false

  return isAdmin || isJefeZonal || isDirector || tieneZonaACargo
}
