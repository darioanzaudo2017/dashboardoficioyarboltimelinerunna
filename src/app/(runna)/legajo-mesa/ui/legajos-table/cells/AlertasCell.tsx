"use client"

import type { GridRenderCellParams } from "@mui/x-data-grid"
import { UserPermissions, buildAlertasVirtuales } from "@/utils/notification-utils"
import { AlertasChip } from "../../../components/indicadores-chips"
import { useUserPermissions } from "../../../hooks/useUserPermissions"

/** Chip de alertas: combina las alertas reales con las virtuales por rol. */
export const AlertasCell = ({
  params,
  permissions,
}: {
  params: GridRenderCellParams
  permissions: ReturnType<typeof useUserPermissions>
}) => {
  const userPerms: UserPermissions = {
    isDirector: permissions.isDirector,
    isLegales: permissions.isLegales,
    isEquipoTecnico: permissions.isEquipoTecnico,
    isJefeZonal: permissions.isJefeZonal,
    isAdmin: permissions.isAdmin,
    userId: permissions.user?.id,
  }

  // Las alertas virtuales salen del estado actual de la etapa actual de las
  // medidas vigentes (comparacion exacta), no de un match por substring.
  const virtualAlerts = buildAlertasVirtuales(params.row, userPerms)

  return (
    <AlertasChip
      alertas={params.row.alertas || []}
      virtualAlerts={virtualAlerts}
    />
  )
}
