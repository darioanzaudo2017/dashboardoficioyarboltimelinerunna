"use client"

import type React from "react"
import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { ViewListRounded, TableRowsRounded } from "@mui/icons-material"
import { gradients, rgba } from "@/theme/colors"
import type { ViewMode } from "../types"

interface DemandaHeaderBarProps {
  viewMode: ViewMode
  onViewModeChange: (event: React.MouseEvent<HTMLElement>, next: ViewMode | null) => void
}

/** Barra 1: título de la sección + conmutador Lista/Tabla. */
export const DemandaHeaderBar = ({ viewMode, onViewModeChange }: DemandaHeaderBarProps) => (
  <Box
    sx={{
      px: { xs: 2, md: 3 },
      py: { xs: 1.5, md: 2.5 },
      display: "flex",
      alignItems: { xs: "stretch", sm: "center" },
      justifyContent: "space-between",
      flexDirection: { xs: "column", sm: "row" },
      gap: 1.5,
      borderBottom: `1px solid ${rgba.primaryLight(0.15)}`,
      background: gradients.subtle,
    }}
  >
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        fontSize: { xs: "1.125rem", md: "1.5rem" },
        background: gradients.success,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "-0.5px",
      }}
    >
      Mesa de Entradas
    </Typography>

    <ToggleButtonGroup
      size="small"
      exclusive
      value={viewMode}
      onChange={onViewModeChange}
      aria-label="Modo de vista"
      sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
    >
      <ToggleButton value="list" aria-label="Vista lista" sx={{ textTransform: "none", px: 1.25 }}>
        <ViewListRounded fontSize="small" sx={{ mr: 0.5 }} />
        Lista
      </ToggleButton>
      <ToggleButton value="tabla" aria-label="Vista tabla" sx={{ textTransform: "none", px: 1.25 }}>
        <TableRowsRounded fontSize="small" sx={{ mr: 0.5 }} />
        Tabla
      </ToggleButton>
    </ToggleButtonGroup>
  </Box>
)
