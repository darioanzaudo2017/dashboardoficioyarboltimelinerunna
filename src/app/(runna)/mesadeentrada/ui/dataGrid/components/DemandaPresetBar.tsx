"use client"

import { Box, Button, Typography } from "@mui/material"
import { PRESETS } from "../constants"
import type { PresetKey } from "../types"

interface DemandaPresetBarProps {
  activePreset: PresetKey | null
  onPresetClick: (key: PresetKey) => void
}

/** Vistas predefinidas: cada botón aplica un columnVisibilityModel preconfigurado. */
export const DemandaPresetBar = ({ activePreset, onPresetClick }: DemandaPresetBarProps) => (
  <Box
    sx={{
      px: { xs: 2, md: 3 },
      py: 1,
      display: "flex",
      alignItems: "center",
      gap: 1,
      flexWrap: "wrap",
      borderBottom: "1px solid #e0e0e0",
      bgcolor: "#fff",
    }}
  >
    <Typography variant="caption" sx={{ color: "text.secondary", mr: 1 }}>
      Vistas:
    </Typography>
    {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
      const isActive = activePreset === key
      return (
        <Button
          key={key}
          size="small"
          variant={isActive ? "contained" : "outlined"}
          onClick={() => onPresetClick(key)}
          sx={{
            textTransform: "none",
            borderRadius: 999,
            px: 1.5,
            py: 0.25,
            fontSize: "0.75rem",
            fontWeight: isActive ? 600 : 500,
            minHeight: 28,
          }}
        >
          {PRESETS[key].label}
        </Button>
      )
    })}
    <Typography variant="caption" sx={{ ml: "auto", color: "text.disabled" }}>
      Usa el menú de columnas para personalizar
    </Typography>
  </Box>
)
