"use client"

import { Box, Checkbox, Chip, TableCell, TableRow, Tooltip, Typography } from "@mui/material"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import {
  getActorColor,
  ACTOR_LABELS,
  ZONA_TIPO_LABELS,
  getZonaTipoColor,
} from "../../../../[id]/medida/[medidaId]/types/actividades"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import { ResponsablesAvatarGroup } from "../../../../[id]/medida/[medidaId]/components/medida/ResponsablesAvatarGroup"
import { DeadlineIndicator } from "../../../../[id]/medida/[medidaId]/components/medida/DeadlineIndicator"
import { getEstadoColor } from "../constants"
import { formatDate } from "../utils"
import { ActividadTipoCell } from "./ActividadTipoCell"
import { ActividadRowActions } from "./ActividadRowActions"
import type { ActividadesTableProps } from "./tableProps"

type ActividadTableRowProps = Omit<
  ActividadesTableProps,
  | "paginatedActividades"
  | "hasActiveFilters"
  | "handleClearFilters"
  | "variant"
  | "isAllSelected"
  | "isIndeterminate"
  | "handleSelectAll"
> & { actividad: TActividadPlanTrabajo }

/** Fila de la tabla de escritorio para una actividad. */
export const ActividadTableRow = ({
  actividad,
  features,
  selectedIds,
  legajosLabelMap,
  hasMultipleLegajos,
  isActivityRead,
  shouldHighlightForRole,
  handleRowClick,
  handleSelectOne,
  handleViewDetail,
  handleRequestAcuse,
  handleEdit,
  handleCancel,
  handleAssign,
  handleGoToLegajo,
}: ActividadTableRowProps) => {
  const estadoConfig = getEstadoColor(actividad.estado)
  const isSelected = selectedIds.has(actividad.id)
  // Sprint 2: Use leida_por_mi from API response (all variants)
  const isRead = isActivityRead(actividad)
  const isUnread = !isRead
  const isRoleHighlighted = shouldHighlightForRole(actividad)

  return (
    <TableRow
      key={actividad.id}
      hover
      selected={isSelected}
      onClick={() => handleRowClick(actividad)}
      sx={{
        backgroundColor: isSelected
          ? "rgba(156, 39, 176, 0.08)"
          : isRoleHighlighted
            ? "rgba(25, 118, 210, 0.12)" // More visible for role-pending (increased from 0.06)
            : isUnread
              ? "rgba(25, 118, 210, 0.04)" // Light blue for unread
              : actividad.esta_vencida && actividad.estado === "PENDIENTE"
                ? "rgba(211, 47, 47, 0.05)"
                : actividad.es_borrador
                  ? "rgba(237, 108, 2, 0.05)"
                  : "transparent",
        borderLeft: isSelected
          ? "4px solid #9c27b0"
          : isRoleHighlighted
            ? "4px solid #3f51b5" // Primary indigo for role-pending
            : isUnread
              ? "4px solid #1976d2" // Blue left border for unread
              : actividad.esta_vencida && actividad.estado === "PENDIENTE"
                ? "4px solid #d32f2f"
                : actividad.es_borrador
                  ? "4px solid #ed6c02"
                  : "4px solid transparent",
        transition: "all 0.2s",
        cursor: "pointer", // All variants: clickable rows open detail modal
        fontWeight: isUnread || isRoleHighlighted ? 600 : 400, // Bold text for unread or role-pending
      }}
    >
        {/* Checkbox */}
        {features.showCheckbox && (
          <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={isSelected} onChange={() => handleSelectOne(actividad.id)} color="primary" />
          </TableCell>
        )}

        <ActividadTipoCell
          actividad={actividad}
          isUnread={isUnread}
          legajosLabelMap={legajosLabelMap}
          hasMultipleLegajos={hasMultipleLegajos}
        />

        {/* NNyA / Legajo */}
        {features.showNnyaLegajo && (
          <TableCell>
            {actividad.legajo_info ? (
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {actividad.legajo_info.nnya_apellido}, {actividad.legajo_info.nnya_nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {actividad.legajo_info.numero}
                </Typography>
                {actividad.medida_info && (
                  <Chip
                    label={actividad.medida_info.tipo_medida}
                    size="small"
                    sx={{
                      ml: 1,
                      fontSize: "0.65rem",
                      height: 18,
                      backgroundColor: actividad.medida_info.estado_vigencia === "VIGENTE" ? "rgba(76, 175, 80, 0.1)" : "rgba(158, 158, 158, 0.1)",
                      color: actividad.medida_info.estado_vigencia === "VIGENTE" ? "#388e3c" : "#757575",
                    }}
                  />
                )}
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Sin información
              </Typography>
            )}
          </TableCell>
        )}

        {/* Equipo */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-start" }}>
            <Chip
              label={actividad.actor_display || ACTOR_LABELS[actividad.actor] || actividad.actor}
              size="small"
              sx={{ backgroundColor: getActorColor(actividad.actor), color: "white", fontSize: "0.7rem", fontWeight: 500 }}
            />
            {actividad.equipo_info?.nombre && (
              <Tooltip title="Equipo asignado">
                <Chip
                  icon={<LocationOnIcon sx={{ fontSize: 13 }} />}
                  label={actividad.equipo_info.nombre}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.65rem",
                    height: 20,
                    maxWidth: 160,
                    "& .MuiChip-icon": { color: "inherit" },
                  }}
                />
              </Tooltip>
            )}
            {actividad.zonas_info && actividad.zonas_info.length > 0 && (
              <Tooltip title={actividad.zonas_info.map((zona) => zona.nombre).join(", ")}>
                <Chip
                  icon={<LocationOnIcon sx={{ fontSize: 13 }} />}
                  label={`${actividad.zonas_info.length} ${actividad.zonas_info.length === 1 ? "zona" : "zonas"}`}
                  size="small"
                  variant="outlined"
                  sx={{ display: { sm: "flex", xl: "none" }, fontSize: "0.65rem", height: 20 }}
                />
              </Tooltip>
            )}
          </Box>
        </TableCell>

        {/* Zonas */}
        {features.showZonas && (
          <TableCell onClick={(e) => e.stopPropagation()} sx={{ display: { sm: "none", xl: "table-cell" } }}>
            {actividad.zonas_info && actividad.zonas_info.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {actividad.zonas_info.map((zona) => (
                  <Tooltip
                    key={zona.id}
                    title={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{zona.nombre}</Typography>
                        <Typography variant="caption">
                          {ZONA_TIPO_LABELS[zona.tipo_responsabilidad] || zona.tipo_responsabilidad}
                        </Typography>
                        {zona.user_responsable && (
                          <Typography variant="caption" display="block">
                            Responsable: {zona.user_responsable.nombre_completo}
                          </Typography>
                        )}
                      </Box>
                    }
                  >
                    <Chip
                      icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                      label={zona.nombre}
                      size="small"
                      sx={{
                        backgroundColor: `${getZonaTipoColor(zona.tipo_responsabilidad)}15`,
                        color: getZonaTipoColor(zona.tipo_responsabilidad),
                        fontSize: "0.65rem",
                        height: 22,
                        "& .MuiChip-icon": { color: "inherit" }
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">Sin zonas</Typography>
            )}
          </TableCell>
        )}

        {/* Responsables */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <ResponsablesAvatarGroup
            responsablePrincipal={actividad.responsable_principal_info}
            responsablesSecundarios={actividad.responsables_secundarios_info}
          />
        </TableCell>

        {/* Fecha Planificación */}
        {features.showFechaPlanificacion && (
          <TableCell>
            <Typography variant="body2">{formatDate(actividad.fecha_planificacion)}</Typography>
          </TableCell>
        )}

        {/* Estado */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Chip
            label={actividad.estado_display || estadoConfig.label}
            sx={{ backgroundColor: estadoConfig.backgroundColor, color: estadoConfig.color, fontWeight: 500, fontSize: "0.75rem" }}
            size="small"
          />
        </TableCell>

        {/* Plazo */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <DeadlineIndicator
            diasRestantes={actividad.dias_restantes}
            estaVencida={actividad.esta_vencida}
            estado={actividad.estado}
            fechaPlanificacion={actividad.fecha_planificacion}
          />
        </TableCell>
        <ActividadRowActions
          actividad={actividad}
          features={features}
          isRead={isRead}
          handleViewDetail={handleViewDetail}
          handleRequestAcuse={handleRequestAcuse}
          handleEdit={handleEdit}
          handleCancel={handleCancel}
          handleAssign={handleAssign}
          handleGoToLegajo={handleGoToLegajo}
        />
      </TableRow>
  )
}
