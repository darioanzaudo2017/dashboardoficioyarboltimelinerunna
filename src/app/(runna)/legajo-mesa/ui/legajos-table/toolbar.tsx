"use client"

import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material"
import { GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid"
import { DownloadRounded, Info, Refresh } from "@mui/icons-material"

// Custom toolbar component
export const CustomToolbar = ({ onExportXlsx, onRefresh }: { onExportXlsx: () => void; onRefresh: () => void }) => {
  return (
    <GridToolbarContainer
      sx={{
        p: 1.5,
        borderBottom: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        gap: 1,
      }}
    >
      <GridToolbarFilterButton />
      <Button
        size="small"
        startIcon={<DownloadRounded sx={{ fontSize: 18 }} />}
        onClick={onExportXlsx}
        sx={{
          color: "#475569",
          fontSize: "0.8125rem",
          fontWeight: 500,
          textTransform: "none",
          "&:hover": { bgcolor: "#f1f5f9" },
        }}
      >
        Exportar Excel
      </Button>
      <Tooltip
        title={
          <Box sx={{ p: 0.5 }}>
            <Typography variant="caption" sx={{ display: "block", fontWeight: 600, mb: 0.5 }}>
              Ordenamiento Multi-columna
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.85)" }}>
              • Click en encabezado: ordena por una columna
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.85)" }}>
              • Ctrl/Cmd + Click: agrega columna al ordenamiento
            </Typography>
          </Box>
        }
        placement="right"
        arrow
      >
        <IconButton size="small" sx={{ color: "#94a3b8", "&:hover": { bgcolor: "#f1f5f9", color: "#475569" } }}>
          <Info sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }} />
      <Tooltip title="Actualizar datos" arrow>
        <IconButton
          size="small"
          onClick={onRefresh}
          aria-label="Actualizar bandeja de legajos"
          sx={{
            color: "#94a3b8",
            "&:hover": { bgcolor: "#f1f5f9", color: "#475569" },
          }}
        >
          <Refresh sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </GridToolbarContainer>
  )
}
