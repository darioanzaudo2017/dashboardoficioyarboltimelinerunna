"use client"

import type React from "react"
import { Box, Chip, Tooltip, Typography } from "@mui/material"
import { getActorColor, type ActorEnum } from "../../../types/actividades"
import type { TActividadPlanTrabajo } from "../../../types/actividades"
import { actividadLabel, getEstadoStyle } from "./calendar-utils"

interface ActividadPillProps {
  actividad: TActividadPlanTrabajo
  onClick: () => void
  /** Compacto (grilla de mes) vs. completo (semana/día). */
  dense?: boolean
}

/** Ítem de actividad para el calendario: borde por equipo (técnico/legal), punto por estado. */
export const ActividadPill: React.FC<ActividadPillProps> = ({ actividad, onClick, dense = true }) => {
  const actorColor = getActorColor(actividad.actor as ActorEnum)
  const estadoStyle = getEstadoStyle(actividad)
  const label = actividadLabel(actividad)
  const responsable = actividad.responsable_principal_info?.nombre_completo || actividad.responsable_principal_info?.full_name

  const tooltip = (
    <Box sx={{ fontSize: 12 }}>
      <div>{label}</div>
      <div>Equipo: {actividad.actor === "EQUIPO_LEGAL" ? "Legales" : "Técnico"}</div>
      <div>Estado: {estadoStyle.label}</div>
      {responsable && <div>Responsable: {responsable}</div>}
    </Box>
  )

  if (dense) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        <Box
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            px: "6px",
            py: "2px",
            mb: "3px",
            borderRadius: "5px",
            borderLeft: `3px solid ${actorColor}`,
            bgcolor: estadoStyle.bg,
            cursor: "pointer",
            overflow: "hidden",
            "&:hover": { filter: "brightness(0.96)" },
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: estadoStyle.color, flexShrink: 0 }} />
          <Typography noWrap sx={{ fontSize: 11, fontWeight: 500, color: "#1e293b" }}>
            {label}
          </Typography>
        </Box>
      </Tooltip>
    )
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        p: "8px 10px",
        mb: "6px",
        borderRadius: "8px",
        borderLeft: `4px solid ${actorColor}`,
        bgcolor: "#fff",
        border: "1px solid #e2e8f0",
        borderLeftWidth: "4px",
        cursor: "pointer",
        transition: "box-shadow .15s",
        "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,.08)" },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }} noWrap>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#64748b" }} noWrap>
          {actividad.actor === "EQUIPO_LEGAL" ? "Equipo Legales" : "Equipo Técnico"}
          {responsable ? ` · ${responsable}` : ""}
        </Typography>
      </Box>
      <Chip
        label={estadoStyle.label}
        size="small"
        sx={{
          height: 20,
          fontSize: 10,
          fontWeight: 700,
          color: estadoStyle.color,
          bgcolor: estadoStyle.bg,
          flexShrink: 0,
        }}
      />
    </Box>
  )
}
