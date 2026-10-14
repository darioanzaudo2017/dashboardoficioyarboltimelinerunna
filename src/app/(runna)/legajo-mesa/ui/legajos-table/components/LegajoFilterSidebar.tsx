"use client"

/**
 * Sidebar de filtros rápidos para la Bandeja de Legajos — mismo patrón que
 * `DemandaFilterSidebar` en la Mesa de Entradas: atajos de un clic sobre los
 * MISMOS filtros que ya existen en los popovers "Filtros"/"Avanzados"
 * (`LegajoFilters`, ver `value` prop ahí para el sync), más un preset
 * ("tareas propias pendientes") que no tiene parámetro de backend y se
 * resuelve reusando la lógica de la campanita de notificaciones
 * (`shouldNotifyActivity` en `useLegajosConTareaPendiente`).
 *
 * Colapsa a un riel de ícono para no robarle ancho a la tabla/lista cuando no
 * se está usando.
 */
import type React from "react"
import { useState } from "react"
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material"
import TuneRounded from "@mui/icons-material/TuneRounded"
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded"
import AssignmentIndRounded from "@mui/icons-material/AssignmentIndRounded"
import PendingActionsRounded from "@mui/icons-material/PendingActionsRounded"
import PriorityHighRounded from "@mui/icons-material/PriorityHighRounded"
import NotificationsActiveRounded from "@mui/icons-material/NotificationsActiveRounded"
import EventBusyRounded from "@mui/icons-material/EventBusyRounded"
import MarkEmailUnreadRounded from "@mui/icons-material/MarkEmailUnreadRounded"
import ClearAllRounded from "@mui/icons-material/ClearAllRounded"
import { institutionalColors, rgba } from "@/theme/colors"
import type { LegajoFiltersState } from "../../legajos-filters"

type LegajoApiFilters = LegajoFiltersState & { search: string | null }

interface LegajoFilterSidebarProps {
  filters: LegajoApiFilters
  onFilterChange: (partial: Partial<LegajoFiltersState>) => void
  currentUserId?: number
  /** "Con tareas propias pendientes": no tiene parámetro de backend, se calcula en LegajoTable y se aplica del lado del cliente. */
  tareasPendientesActivo: boolean
  onToggleTareasPendientes: () => void
  tareasPendientesLoading?: boolean
  onClearAll: () => void
}

interface PresetItem {
  key: string
  label: string
  icon: React.ReactNode
  selected: boolean
  onClick: () => void
}

function PresetButton({ label, icon, selected, onClick, badge }: Omit<PresetItem, "key"> & { badge?: React.ReactNode }) {
  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{
        px: 2,
        py: 0.75,
        mx: 1,
        my: 0.35,
        borderRadius: 1,
        width: "auto",
        "&.Mui-selected": {
          bgcolor: institutionalColors.azulPrincipal,
          color: "#fff",
          "&:hover": { bgcolor: institutionalColors.primaryDark },
          "& .MuiListItemIcon-root": { color: "#fff" },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }} />
      {badge}
    </ListItemButton>
  )
}

export const LegajoFilterSidebar: React.FC<LegajoFilterSidebarProps> = ({
  filters,
  onFilterChange,
  currentUserId,
  tareasPendientesActivo,
  onToggleTareasPendientes,
  tareasPendientesLoading,
  onClearAll,
}) => {
  const [expanded, setExpanded] = useState(true)

  const misLegajosActivo = currentUserId != null && filters.user_responsable === currentUserId
  const prioridadAltaActiva = filters.urgencia === "ALTA"
  const conAlertasActivo = filters.tiene_alertas === true
  const actividadesVencidasActivo = filters.pt_vencidas === true
  const oficiosVencidosActivo = filters.oficios_vencidos === true

  const activeCount =
    (misLegajosActivo ? 1 : 0) +
    (tareasPendientesActivo ? 1 : 0) +
    (prioridadAltaActiva ? 1 : 0) +
    (conAlertasActivo ? 1 : 0) +
    (actividadesVencidasActivo ? 1 : 0) +
    (oficiosVencidosActivo ? 1 : 0)

  const handleClearAll = () => {
    onClearAll()
    if (tareasPendientesActivo) onToggleTareasPendientes()
  }

  if (!expanded) {
    return (
      <Box
        sx={{
          width: 48,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 1.5,
          bgcolor: "#fff",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          alignSelf: "flex-start",
        }}
      >
        <Tooltip title="Mostrar filtros rápidos" placement="right">
          <IconButton onClick={() => setExpanded(true)} aria-label="Expandir filtros rápidos">
            <Badge badgeContent={activeCount} color="primary">
              <TuneRounded sx={{ color: institutionalColors.azulPrincipal }} />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: "#fff",
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        alignSelf: "flex-start",
        maxHeight: "calc(100vh - 140px)",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.25,
          borderBottom: "1px solid #e0e0e0",
          position: "sticky",
          top: 0,
          bgcolor: "#fff",
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TuneRounded fontSize="small" sx={{ color: institutionalColors.azulPrincipal }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Filtros rápidos
          </Typography>
        </Box>
        <Tooltip title="Contraer">
          <IconButton size="small" onClick={() => setExpanded(false)} aria-label="Contraer filtros rápidos">
            <ChevronLeftRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography
        variant="caption"
        sx={{ px: 2, pt: 1.5, pb: 0.5, display: "block", fontWeight: 700, color: "text.secondary" }}
      >
        Orientarme
      </Typography>
      <List disablePadding dense>
        <PresetButton
          label="Mis legajos"
          icon={<AssignmentIndRounded fontSize="small" />}
          selected={misLegajosActivo}
          onClick={() =>
            onFilterChange({ user_responsable: misLegajosActivo ? null : currentUserId ?? null })
          }
        />
        <PresetButton
          label="Tareas propias pendientes"
          icon={<PendingActionsRounded fontSize="small" />}
          selected={tareasPendientesActivo}
          onClick={onToggleTareasPendientes}
          badge={
            tareasPendientesLoading ? (
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                …
              </Typography>
            ) : undefined
          }
        />
      </List>

      <Divider />

      <Typography
        variant="caption"
        sx={{ px: 2, pt: 1.5, pb: 0.5, display: "block", fontWeight: 700, color: "text.secondary" }}
      >
        Prioridad y alertas
      </Typography>
      <List disablePadding dense>
        <PresetButton
          label="Prioridad alta"
          icon={<PriorityHighRounded fontSize="small" />}
          selected={prioridadAltaActiva}
          onClick={() => onFilterChange({ urgencia: prioridadAltaActiva ? null : "ALTA" })}
        />
        <PresetButton
          label="Con alertas"
          icon={<NotificationsActiveRounded fontSize="small" />}
          selected={conAlertasActivo}
          onClick={() => onFilterChange({ tiene_alertas: conAlertasActivo ? null : true })}
        />
        <PresetButton
          label="Actividades vencidas"
          icon={<EventBusyRounded fontSize="small" />}
          selected={actividadesVencidasActivo}
          onClick={() => onFilterChange({ pt_vencidas: actividadesVencidasActivo ? null : true })}
        />
        <PresetButton
          label="Oficios vencidos"
          icon={<MarkEmailUnreadRounded fontSize="small" />}
          selected={oficiosVencidosActivo}
          onClick={() => onFilterChange({ oficios_vencidos: oficiosVencidosActivo ? null : true })}
        />
      </List>

      <Divider />

      <Box sx={{ p: 1 }}>
        <ListItemButton
          disabled={activeCount === 0}
          onClick={handleClearAll}
          sx={{ borderRadius: 1, justifyContent: "center", gap: 1 }}
        >
          <ClearAllRounded fontSize="small" />
          <Typography variant="caption" fontWeight={600}>
            Limpiar filtros{activeCount > 0 ? ` (${activeCount})` : ""}
          </Typography>
        </ListItemButton>
      </Box>
    </Box>
  )
}
