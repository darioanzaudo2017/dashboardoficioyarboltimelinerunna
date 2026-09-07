"use client"

import type React from "react"
import { Box, IconButton, LinearProgress, Paper, Tooltip, Typography } from "@mui/material"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import { SectionCard } from "../../../../[id]/medida/[medidaId]/components/medida/shared/section-card"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import type { ActividadFeatures } from "../features"

interface ActividadesWrapperProps {
  showWrapper: boolean
  features: ActividadFeatures
  title: string | undefined
  statistics: { completionRate: number }
  isFetching: boolean
  actividades: TActividadPlanTrabajo[]
  children: React.ReactNode
}

/** Envoltorio del contenido: SectionCard (legajo) o Paper con barra de carga. */
export const ActividadesWrapper = ({
  showWrapper,
  features,
  title,
  statistics,
  isFetching,
  actividades,
  children,
}: ActividadesWrapperProps) => {
  if (!showWrapper) return <>{children}</>

  if (features.useSectionCard) {
    return (
      <SectionCard
        title={title || "Plan de Trabajo"}
        chips={[
          {
            label: `${statistics.completionRate.toFixed(0)}% completado`,
            color: statistics.completionRate === 100 ? "success" : "primary",
          },
        ]}
        headerActions={
          <Tooltip
            title={
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Estados de actividades:
                </Typography>
                <Typography variant="caption" display="block">
                  ✅ Completada: Actividad finalizada
                </Typography>
                <Typography variant="caption" display="block">
                  ▶️ En Progreso: Actividad en curso
                </Typography>
                <Typography variant="caption" display="block">
                  ⏳ Pendiente: Actividad sin iniciar
                </Typography>
                <Typography variant="caption" display="block">
                  ❌ Vencida: Actividad pasada la fecha límite
                </Typography>
              </Box>
            }
            arrow
            placement="right"
          >
            <IconButton size="small">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      >
        {children}
      </SectionCard>
    )
  }

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, position: "relative" }}>
      {isFetching && actividades.length > 0 && (
        <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "8px 8px 0 0" }} />
      )}
      {children}
    </Paper>
  )
}
