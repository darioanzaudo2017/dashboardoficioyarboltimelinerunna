"use client"

import { useMemo } from "react"
import { useApiQuery, extractArray } from "@/hooks/useApiQuery"
import { shouldNotifyActivity, type UserPermissions } from "@/utils/notification-utils"

/** Mismos estados que disparan la campanita de notificaciones (ver shouldNotifyActivity). */
const ESTADOS_RELEVANTES = "PENDIENTE,EN_PROGRESO,PENDIENTE_VISADO_JZ,PENDIENTE_VISADO"

/**
 * Legajos con al menos una actividad que hoy le dispararía una notificación al
 * usuario actual — misma regla que la campanita (shouldNotifyActivity), para
 * que "tareas propias pendientes" en la bandeja de legajos signifique
 * exactamente lo mismo que ya ve el usuario en las notificaciones.
 */
export const useLegajosConTareaPendiente = (permissions: UserPermissions, enabled: boolean) => {
  const { data, isLoading } = useApiQuery<any>(
    "actividades/",
    { estado: ESTADOS_RELEVANTES, page_size: 500 },
    { enabled: enabled && permissions.userId != null, staleTime: 60_000 },
  )

  const legajoIds = useMemo(() => {
    const actividades = extractArray<any>(data)
    const ids = new Set<number>()
    actividades.forEach((actividad) => {
      if (actividad?.legajo_info?.id && shouldNotifyActivity(actividad, permissions)) {
        ids.add(actividad.legajo_info.id)
      }
    })
    return ids
  }, [data, permissions])

  return { legajoIds, isLoading }
}
