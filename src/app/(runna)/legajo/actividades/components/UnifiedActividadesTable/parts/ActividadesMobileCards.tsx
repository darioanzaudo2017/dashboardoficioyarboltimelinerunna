"use client"

import { Box, Button, Chip, Paper, Typography, Checkbox } from "@mui/material"
import FilterListIcon from "@mui/icons-material/FilterList"
import FolderIcon from "@mui/icons-material/Folder"
import VisibilityIcon from "@mui/icons-material/Visibility"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread"
import { getActorColor, ACTOR_LABELS } from "../../../../[id]/medida/[medidaId]/types/actividades"
import { DeadlineIndicator } from "../../../../[id]/medida/[medidaId]/components/medida/DeadlineIndicator"
import { getEstadoColor } from "../constants"
import { formatDate } from "../utils"
import type { ActividadesRenderProps } from "./tableProps"

/** Vista en tarjetas para mobile de la variante global. */
export const ActividadesMobileCards = ({
  paginatedActividades,
  features,
  selectedIds,
  hasActiveFilters,
  isActivityRead,
  shouldHighlightForRole,
  handleClearFilters,
  handleRowClick,
  handleSelectOne,
  handleRequestAcuse,
  handleGoToLegajo,
}: ActividadesRenderProps) => (
  <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1.5, px: 1.5, pb: 1 }}>
    {paginatedActividades.length === 0 ? (
      <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
        <FilterListIcon sx={{ fontSize: 52, color: "text.disabled", mb: 1.5 }} />
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {hasActiveFilters
            ? "No se encontraron actividades con los filtros aplicados"
            : "No tienes actividades asignadas"}
        </Typography>
        {hasActiveFilters && (
          <Button variant="outlined" size="small" onClick={handleClearFilters} sx={{ mt: 1, textTransform: "none" }}>
            Limpiar filtros
          </Button>
        )}
      </Box>
    ) : (
      paginatedActividades.map((actividad) => {
        const estadoConfig = getEstadoColor(actividad.estado)
        const isSelected = selectedIds.has(actividad.id)
        const isRead = isActivityRead(actividad)
        const isUnread = !isRead
        const isRoleHighlighted = shouldHighlightForRole(actividad)
        const responsable = actividad.responsable_principal_info?.nombre_completo
          || actividad.responsable_principal_info?.username
          || "Sin responsable principal"

        return (
          <Paper
            component="article"
            key={actividad.id}
            elevation={0}
            onClick={() => handleRowClick(actividad)}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: isSelected ? "secondary.main" : isRoleHighlighted || isUnread ? "primary.light" : "divider",
              borderLeft: `4px solid ${
                isSelected ? "#9c27b0" : isRoleHighlighted ? "#3f51b5" : isUnread ? "#1976d2" : "transparent"
              }`,
              bgcolor: isSelected ? "rgba(156,39,176,.06)" : isRoleHighlighted ? "rgba(25,118,210,.07)" : "background.paper",
              cursor: "pointer",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
              {features.showCheckbox && (
                <Checkbox
                  checked={isSelected}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => handleSelectOne(actividad.id)}
                  inputProps={{ "aria-label": `Seleccionar actividad ${actividad.tipo_actividad_info?.nombre || actividad.id}` }}
                  size="small"
                  sx={{ p: 0.25, mt: -0.25 }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                  {actividad.tipo_actividad_info?.nombre || "Sin tipo"}
                </Typography>
                {actividad.subtipo_actividad_info?.nombre && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {actividad.subtipo_actividad_info.nombre}
                  </Typography>
                )}
              </Box>
              <Chip
                label={actividad.estado_display || estadoConfig.label}
                size="small"
                sx={{
                  flexShrink: 0,
                  maxWidth: "45%",
                  bgcolor: estadoConfig.backgroundColor,
                  color: estadoConfig.color,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                }}
              />
            </Box>

            {actividad.legajo_info && (
              <Box sx={{ mb: 1.25 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {[actividad.legajo_info.nnya_apellido, actividad.legajo_info.nnya_nombre].filter(Boolean).join(", ") || "NNyA sin nombre"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {actividad.legajo_info.numero}
                  {actividad.medida_info?.tipo_medida ? ` · ${actividad.medida_info.tipo_medida}` : ""}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.25 }}>
              {isUnread && <Chip label="Nueva" size="small" color="primary" sx={{ fontWeight: 700 }} />}
              <Chip
                label={actividad.actor_display || ACTOR_LABELS[actividad.actor] || actividad.actor}
                size="small"
                sx={{ bgcolor: getActorColor(actividad.actor), color: "white", fontWeight: 600 }}
              />
              {actividad.zonas_info?.map((zona) => (
                <Chip
                  key={zona.id}
                  icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                  label={zona.nombre}
                  size="small"
                  variant="outlined"
                  sx={{ maxWidth: "100%", "& .MuiChip-icon": { color: "inherit" } }}
                />
              ))}
              {actividad.oficio_origen && (
                <Chip
                  label={actividad.oficio_origen.estado_respuesta === "CONTESTADO" ? "Oficio contestado" : "Oficio pendiente"}
                  size="small"
                  color={actividad.oficio_origen.estado_respuesta === "CONTESTADO" ? "success" : "warning"}
                  sx={{ fontWeight: 600 }}
                />
              )}
              {actividad.esta_vencida && actividad.estado === "PENDIENTE" && (
                <Chip label="Vencida" size="small" color="error" sx={{ fontWeight: 700 }} />
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 1,
                alignItems: "center",
                py: 1,
                borderTop: "1px solid",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Responsable
                </Typography>
                <Typography variant="body2" noWrap title={responsable}>
                  {responsable}
                </Typography>
                {features.showFechaPlanificacion && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    Planificada: {formatDate(actividad.fecha_planificacion)}
                  </Typography>
                )}
              </Box>
              <DeadlineIndicator
                diasRestantes={actividad.dias_restantes}
                estaVencida={actividad.esta_vencida}
                estado={actividad.estado}
                fechaPlanificacion={actividad.fecha_planificacion}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 1.25 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={isRead ? <VisibilityIcon /> : <MarkEmailUnreadIcon />}
                onClick={(event) => {
                  event.stopPropagation()
                  handleRequestAcuse(actividad)
                }}
                sx={{ textTransform: "none" }}
              >
                {isRead ? "Ver detalle" : "Leer actividad"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FolderIcon />}
                disabled={!actividad.legajo_info || !actividad.medida_info}
                onClick={(event) => {
                  event.stopPropagation()
                  handleGoToLegajo(actividad)
                }}
                sx={{ textTransform: "none" }}
              >
                Ir al legajo
              </Button>
            </Box>
          </Paper>
        )
      })
    )}
  </Box>
)
