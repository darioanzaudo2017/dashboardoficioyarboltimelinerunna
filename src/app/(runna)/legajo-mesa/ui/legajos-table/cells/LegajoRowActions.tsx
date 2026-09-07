"use client"

import { Box, IconButton, Tooltip, alpha } from "@mui/material"
import { PersonAdd, Visibility } from "@mui/icons-material"
import type { GridRenderCellParams } from "@mui/x-data-grid"
import ActionMenu from "../../../components/action-menu"
import { useUserPermissions } from "../../../hooks/useUserPermissions"

/** Acciones por fila: ver detalle, asignar y menú contextual. */
export const LegajoRowActions = ({
  params,
  permissions,
  handleOpenModal,
  handleOpenAsignarModal,
}: {
  params: GridRenderCellParams
  permissions: ReturnType<typeof useUserPermissions>
  handleOpenModal: (legajoId: number) => void
  handleOpenAsignarModal: (legajoId: number) => void
}) => (
  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", justifyContent: "center" }}>
    <Tooltip title="Ver detalles" arrow>
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); handleOpenModal(params.row.id) }}
        sx={{
          color: "#3b82f6",
          bgcolor: alpha("#3b82f6", 0.08),
          "&:hover": { bgcolor: alpha("#3b82f6", 0.16) },
          width: 30,
          height: 30,
        }}
      >
        <Visibility sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
    {permissions.canAssign && (
      <Tooltip title="Asignar" arrow>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); handleOpenAsignarModal(params.row.id) }}
          sx={{
            color: "#8b5cf6",
            bgcolor: alpha("#8b5cf6", 0.08),
            "&:hover": { bgcolor: alpha("#8b5cf6", 0.16) },
            width: 30,
            height: 30,
          }}
        >
          <PersonAdd sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    )}
    <ActionMenu
      legajoId={params.row.id}
      demandaId={params.row.indicadores?.demanda_pi_id || null}
      tieneMedidas={params.row.medidas_activas_count > 0}
      tieneOficios={params.row.oficios_count > 0}
      tienePlanTrabajo={true}
      onViewDetail={handleOpenModal}
      onAssign={handleOpenAsignarModal}
      userPermissions={permissions}
    />
  </Box>
)
