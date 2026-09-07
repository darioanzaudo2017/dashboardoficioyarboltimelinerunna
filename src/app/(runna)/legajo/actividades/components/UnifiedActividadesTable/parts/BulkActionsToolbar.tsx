"use client"

import type React from "react"
import { Box, Button, Collapse, Paper, Typography } from "@mui/material"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import type { ActividadFeatures } from "../features"

interface BulkActionsToolbarProps {
  features: ActividadFeatures
  selectedIds: Set<number>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>
  setBulkModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

/** Barra de acciones en lote, visible cuando hay actividades seleccionadas. */
export const BulkActionsToolbar = ({
  features,
  selectedIds,
  setSelectedIds,
  setBulkModalOpen,
}: BulkActionsToolbarProps) => {
  if (!features.showBulkAssign || selectedIds.size === 0) return null

  return (
    <Collapse in={selectedIds.size > 0}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: "primary.50",
          border: "1px solid",
          borderColor: "primary.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CheckBoxIcon color="primary" />
          <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
            {selectedIds.size} {selectedIds.size === 1 ? "actividad seleccionada" : "actividades seleccionadas"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" }, flexDirection: { xs: "column", sm: "row" } }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AssignmentIndIcon />}
            onClick={() => setBulkModalOpen(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Asignar Responsables
          </Button>
          <Button sx={{ width: { xs: "100%", sm: "auto" } }} variant="outlined" color="inherit" size="small" onClick={() => setSelectedIds(new Set())}>
            Cancelar Selección
          </Button>
        </Box>
      </Paper>
    </Collapse>
  )
}
