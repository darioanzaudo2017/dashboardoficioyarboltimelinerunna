"use client"

import { Box, Grid, LinearProgress, Paper, Typography } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PendingIcon from "@mui/icons-material/Pending"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { ActividadStatistics } from "../../../../[id]/medida/[medidaId]/components/medida/ActividadStatistics"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import type { ActividadFeatures } from "../features"
import type { TableVariant } from "../types"

interface ActividadesStatisticsPanelProps {
  variant: TableVariant
  features: ActividadFeatures
  filteredActividades: TActividadPlanTrabajo[]
  statistics: {
    total: number
    pendientes: number
    enProgreso: number
    realizadas: number
    vencidas: number
    completionRate: number
  }
  totalCount: number
}

/** Barra de progreso (legajo) + tarjetas de estadísticas de la tabla. */
export const ActividadesStatisticsPanel = ({
  variant,
  features,
  filteredActividades,
  statistics,
  totalCount,
}: ActividadesStatisticsPanelProps) => {
  if (variant === "medida") {
    return <ActividadStatistics actividades={filteredActividades} />
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Progress Bar (legajo only) */}
      {features.showProgressBar && (
        <Paper elevation={1} sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Progreso del Plan de Trabajo
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#4caf50" }}>
              {statistics.completionRate.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={statistics.completionRate}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "rgba(0, 0, 0, 0.08)",
              "& .MuiLinearProgress-bar": { borderRadius: 5, backgroundColor: "#4caf50" },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {statistics.realizadas} de {statistics.total} actividades completadas
            </Typography>
            {statistics.vencidas > 0 && (
              <Typography variant="caption" sx={{ color: "#f44336", fontWeight: 600 }}>
                ⚠️ {statistics.vencidas} vencidas
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {/* Stat Cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={1}
            sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255, 152, 0, 0.1)", borderLeft: "4px solid #ff9800" }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <PendingIcon sx={{ color: "#ff9800", fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800" }}>
                {statistics.pendientes}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
              Pendientes
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={1}
            sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(33, 150, 243, 0.1)", borderLeft: "4px solid #2196f3" }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <PlayCircleIcon sx={{ color: "#2196f3", fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#2196f3" }}>
                {statistics.enProgreso}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
              En Progreso
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={1}
            sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(76, 175, 80, 0.1)", borderLeft: "4px solid #4caf50" }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                {variant === "global" ? totalCount : statistics.realizadas}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
              {variant === "global" ? "Total" : "Realizadas"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: statistics.vencidas > 0 ? "rgba(244, 67, 54, 0.1)" : "rgba(156, 39, 176, 0.1)",
              borderLeft: `4px solid ${statistics.vencidas > 0 ? "#f44336" : "#9c27b0"}`,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <ErrorIcon sx={{ color: statistics.vencidas > 0 ? "#f44336" : "#9c27b0", fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: statistics.vencidas > 0 ? "#f44336" : "#9c27b0" }}>
                {statistics.vencidas}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
              Vencidas
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
