"use client"

import type { GridRenderCellParams } from "@mui/x-data-grid"
import { UserPermissions, hasKeyword } from "@/utils/notification-utils"
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
  const allStates = params.row.allStates || []
  const virtualAlerts: any[] = []

  const userPerms: UserPermissions = {
    isDirector: permissions.isDirector,
    isLegales: permissions.isLegales,
    isEquipoTecnico: permissions.isEquipoTecnico,
    isJefeZonal: permissions.isJefeZonal,
    isAdmin: permissions.isAdmin,
    userId: permissions.user?.id,
  }

  if (userPerms.isDirector && (hasKeyword(allStates, "NOTA_AVAL") || hasKeyword(allStates, "PENDIENTE_NOTA_AVAL"))) {
    virtualAlerts.push({ tipo: "URGENTE", severidad: "alta", mensaje: "Pendiente Nota de Aval" })
  }
  if (userPerms.isLegales && (
    hasKeyword(allStates, "JURIDICO") ||
    hasKeyword(allStates, "LEGAL") ||
    hasKeyword(allStates, "RATIFICACION") ||
    hasKeyword(allStates, "PENDIENTE_VISADO")
  )) {
    virtualAlerts.push({ tipo: "URGENTE", severidad: "alta", mensaje: "Pendiente Informe Jurídico" })
  }

  return (
    <AlertasChip
      alertas={params.row.alertas || []}
      virtualAlerts={virtualAlerts}
    />
  )
}
