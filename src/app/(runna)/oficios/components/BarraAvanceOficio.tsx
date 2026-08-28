"use client"

/**
 * Barra de avance de un oficio: un tramo por actividad (mismo ancho cada
 * uno), coloreado con el color real de su estado — no un único color
 * verde/naranja de "% completo" genérico, sino la mezcla real de estados
 * (Pendiente, En Progreso, Visado Aprobado, etc.) tal como se ve en el resto
 * de la app.
 */
import type React from "react"
import { Box, Stack, Tooltip } from "@mui/material"
import type { TActividadPlanTrabajo } from "../../legajo/[id]/medida/[medidaId]/types/actividades"
import { colorEstadoActividad } from "../lib/estado-colores"

interface BarraAvanceOficioProps {
  actividades: TActividadPlanTrabajo[]
}

export const BarraAvanceOficio: React.FC<BarraAvanceOficioProps> = ({ actividades }) => (
  <Stack direction="row" spacing={0.5} sx={{ height: 10, width: "100%" }}>
    {actividades.map((actividad) => (
      <Tooltip key={actividad.id} title={actividad.estado_display} arrow>
        <Box
          sx={{
            flex: 1,
            height: "100%",
            borderRadius: "4px",
            bgcolor: colorEstadoActividad(actividad.estado),
          }}
        />
      </Tooltip>
    ))}
  </Stack>
)
