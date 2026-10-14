"use client"

/**
 * Sidebar de filtros rápidos para la Mesa de Entradas — pensada como atajo de
 * un clic para los filtros que ya existen (Popover "Filtros" + "Mis
 * demandas"), no como un sistema de filtrado nuevo: escribe sobre el mismo
 * `apiFilters` que ya maneja `DemandaTableContent`, así que cualquier cambio
 * acá también se refleja en el popover y viceversa (ver `value` en
 * `Buttons.tsx`).
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
import ClearAllRounded from "@mui/icons-material/ClearAllRounded"
import { institutionalColors, rgba } from "@/theme/colors"
import type { DemandaApiFilters, DemandaFilterState } from "../types"

type EstadoDemanda = NonNullable<DemandaFilterState["estado_demanda"]>
type ObjetivoDemanda = NonNullable<DemandaFilterState["objetivo_de_demanda"]>
type EnvioRespuesta = NonNullable<DemandaFilterState["envio_de_respuesta"]>

const ESTADO_OPTIONS: { value: EstadoDemanda; label: string; dotColor: string }[] = [
  { value: "SIN_ASIGNAR", label: "Sin Asignar", dotColor: "grey.500" },
  { value: "CONSTATACION", label: "Constatación", dotColor: "success.main" },
  { value: "EVALUACION", label: "Evaluación", dotColor: "info.main" },
  { value: "PENDIENTE_AUTORIZACION", label: "Pendiente Autorización", dotColor: "warning.main" },
  { value: "ARCHIVADA", label: "Archivada", dotColor: "grey.500" },
  { value: "ADMITIDA", label: "Admitida", dotColor: "secondary.main" },
]

const OBJETIVO_OPTIONS: { value: ObjetivoDemanda; label: string }[] = [
  { value: "CONSTATACION", label: "Constatación" },
  { value: "PETICION_DE_INFORME", label: "Petición de Informe" },
]

const ENVIO_OPTIONS: { value: EnvioRespuesta; label: string }[] = [
  { value: "NO_NECESARIO", label: "No Necesario" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "ENVIADO", label: "Enviado" },
]

interface DemandaFilterSidebarProps {
  filters: DemandaApiFilters
  onFilterChange: (filters: DemandaFilterState) => void
  onResponsableFilterChange: (next: { mis_demandas: boolean; responsable: number | null }) => void
}

interface SectionProps<T extends string> {
  title: string
  options: { value: T; label: string; dotColor?: string }[]
  activeValue: T | null
  onToggle: (value: T) => void
}

function FilterSection<T extends string>({ title, options, activeValue, onToggle }: SectionProps<T>) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography
        variant="caption"
        sx={{ px: 2, pt: 1.5, pb: 0.5, display: "block", fontWeight: 700, color: "text.secondary" }}
      >
        {title}
      </Typography>
      <List disablePadding dense>
        {options.map((option) => {
          const selected = activeValue === option.value
          return (
            <ListItemButton
              key={option.value}
              selected={selected}
              onClick={() => onToggle(option.value)}
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 1,
                mx: 1,
                width: "auto",
                "&.Mui-selected": {
                  bgcolor: rgba.primaryLight(0.1),
                  "&:hover": { bgcolor: rgba.primaryLight(0.16) },
                },
              }}
            >
              {option.dotColor && (
                <ListItemIcon sx={{ minWidth: 20 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: option.dotColor }} />
                </ListItemIcon>
              )}
              <ListItemText
                primary={option.label}
                primaryTypographyProps={{
                  fontSize: "0.82rem",
                  fontWeight: selected ? 600 : 400,
                  color: selected ? institutionalColors.azulPrincipal : "text.primary",
                  noWrap: true,
                }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}

export const DemandaFilterSidebar: React.FC<DemandaFilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResponsableFilterChange,
}) => {
  const [expanded, setExpanded] = useState(true)

  const activeCount =
    (filters.estado_demanda ? 1 : 0) +
    (filters.objetivo_de_demanda ? 1 : 0) +
    (filters.envio_de_respuesta ? 1 : 0) +
    (filters.mis_demandas ? 1 : 0) +
    (filters.responsable != null ? 1 : 0)

  const emit = (partial: Partial<DemandaFilterState>) =>
    onFilterChange({
      envio_de_respuesta: filters.envio_de_respuesta,
      estado_demanda: filters.estado_demanda,
      objetivo_de_demanda: filters.objetivo_de_demanda,
      ...partial,
    })

  const handleClearAll = () => {
    onFilterChange({ envio_de_respuesta: null, estado_demanda: null, objetivo_de_demanda: null })
    onResponsableFilterChange({ mis_demandas: false, responsable: null })
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

      <List disablePadding dense sx={{ py: 0.5 }}>
        <ListItemButton
          selected={filters.mis_demandas}
          onClick={() => onResponsableFilterChange({ mis_demandas: !filters.mis_demandas, responsable: null })}
          sx={{
            px: 2,
            py: 0.75,
            mx: 1,
            my: 0.5,
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
          <ListItemIcon sx={{ minWidth: 32 }}>
            <AssignmentIndRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Mis demandas"
            primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }}
          />
        </ListItemButton>
      </List>

      <Divider />

      <FilterSection
        title="Estado"
        options={ESTADO_OPTIONS}
        activeValue={filters.estado_demanda}
        onToggle={(value) => emit({ estado_demanda: filters.estado_demanda === value ? null : value })}
      />

      <Divider />

      <FilterSection
        title="Objetivo de demanda"
        options={OBJETIVO_OPTIONS}
        activeValue={filters.objetivo_de_demanda}
        onToggle={(value) => emit({ objetivo_de_demanda: filters.objetivo_de_demanda === value ? null : value })}
      />

      <Divider />

      <FilterSection
        title="Envío de respuesta"
        options={ENVIO_OPTIONS}
        activeValue={filters.envio_de_respuesta}
        onToggle={(value) => emit({ envio_de_respuesta: filters.envio_de_respuesta === value ? null : value })}
      />

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
