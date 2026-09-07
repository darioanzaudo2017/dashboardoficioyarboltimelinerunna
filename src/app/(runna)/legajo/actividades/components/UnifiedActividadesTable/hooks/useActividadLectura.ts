"use client"

import { useState, useCallback } from "react"
import { useMutation } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { actividadService } from "../../../../[id]/medida/[medidaId]/services/actividadService"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import type { UserPermissions } from "@/utils/auth/userZustand"
import {
  shouldNotifyActivity,
  UserPermissions as NotificationUserPerms
} from "@/utils/notification-utils"

interface UseActividadLecturaOptions {
  queryClient: QueryClient
  onRefresh: (() => void) | undefined
  user: UserPermissions | null
  roles: { isET: boolean; isJZ: boolean; isLegal: boolean; user_id: number | null }
}

/**
 * Sprint 2 - Lectura multi-usuario: marca actividades como leídas y resuelve
 * el resaltado por rol, con actualización optimista mientras refresca la query.
 */
export const useActividadLectura = ({ queryClient, onRefresh, user, roles }: UseActividadLecturaOptions) => {
  // Sprint 2: Track locally marked-as-read IDs for optimistic UI updates
  // Used to show immediate feedback before query invalidation refreshes data
  const [optimisticReadIds, setOptimisticReadIds] = useState<Set<number>>(new Set())

  // Mutation to mark activity as read
  const marcarLeidaMutation = useMutation({
    mutationFn: (actividadId: number) => actividadService.marcarLeida(actividadId),
    onSuccess: (data) => {
      // Optimistic update for immediate UI feedback
      setOptimisticReadIds((prev) => new Set([...prev, data.actividad]))
      // Invalidate queries to refresh data with updated leida_por_mi
      queryClient.invalidateQueries({ queryKey: ["global-actividades"] })
      // Invalidate medida-specific queries (prefix match)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === "string" && key.startsWith("actividades-plan")
        },
      })
      // For legajo variant (prop-based), call onRefresh to notify parent
      onRefresh?.()
    },
  })

  // Helper function to check if activity has been read by current user
  // Uses leida_por_mi from API response, with optimistic fallback
  const isActivityRead = useCallback(
    (actividad: TActividadPlanTrabajo) => {
      // Check optimistic state first (for immediate feedback after marking as read)
      if (optimisticReadIds.has(actividad.id)) return true
      // Then check the backend-provided field
      return actividad.leida_por_mi === true
    },
    [optimisticReadIds]
  )

  // Helper to determine if an activity should be highlighted for the current user's role
  const shouldHighlightForRole = useCallback(
    (actividad: TActividadPlanTrabajo) => {
      const userPerms: NotificationUserPerms = {
        isDirector: !!user?.groups?.some(g => g.name.toLowerCase().includes("director")),
        isLegales: roles.isLegal,
        isEquipoTecnico: roles.isET,
        isJefeZonal: roles.isJZ,
        isAdmin: !!user?.is_superuser,
        userId: roles.user_id ?? undefined,
      }
      return shouldNotifyActivity(actividad, userPerms)
    },
    [roles, user]
  )

  return { marcarLeidaMutation, isActivityRead, shouldHighlightForRole }
}
