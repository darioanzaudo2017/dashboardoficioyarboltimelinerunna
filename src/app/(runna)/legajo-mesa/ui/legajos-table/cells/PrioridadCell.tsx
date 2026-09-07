"use client"

import { Box, FormControl, MenuItem, Select, alpha } from "@mui/material"
import { PriorityHigh, Remove, KeyboardArrowDown } from "@mui/icons-material"
import type { GridRenderCellParams } from "@mui/x-data-grid"
import { getPriorityColor } from "../../../config/legajo-theme"

/** Selector de prioridad del legajo (ALTA/MEDIA/BAJA) con su código de color. */
export const PrioridadCell = ({
  params,
  handlePrioridadChange,
}: {
  params: GridRenderCellParams
  handlePrioridadChange: (legajoId: number, newValue: string) => void
}) => {
  const colors = getPriorityColor(params.value as any)
  const priorityLabel = params.value === "ALTA" ? "Alta" : params.value === "MEDIA" ? "Media" : params.value === "BAJA" ? "Baja" : null

  return (
    <FormControl size="small" sx={{ minWidth: 100 }}>
      <Select
        value={params.value || ""}
        onChange={(e) => {
          e.stopPropagation()
          handlePrioridadChange(params.row.id, e.target.value as string)
        }}
        onClick={(e) => e.stopPropagation()}
        displayEmpty
        IconComponent={KeyboardArrowDown}
        sx={{
          height: 32,
          fontSize: "0.8125rem",
          fontWeight: 500,
          bgcolor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          borderRadius: 1.5,
          "& .MuiSelect-select": {
            py: 0.5,
            px: 1.5,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "&:hover": {
            bgcolor: alpha(colors.bg, 0.8),
          },
          "& .MuiSvgIcon-root": {
            color: colors.text,
            fontSize: "1.25rem",
          },
        }}
      >
        {params.value === null && (
          <MenuItem value="" sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
            <em>Seleccionar</em>
          </MenuItem>
        )}
        <MenuItem value="ALTA" sx={{ fontSize: "0.8125rem", color: "#c62828", fontWeight: 500 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PriorityHigh sx={{ fontSize: 16 }} />
            Alta
          </Box>
        </MenuItem>
        <MenuItem value="MEDIA" sx={{ fontSize: "0.8125rem", color: "#ef6c00", fontWeight: 500 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Remove sx={{ fontSize: 16 }} />
            Media
          </Box>
        </MenuItem>
        <MenuItem value="BAJA" sx={{ fontSize: "0.8125rem", color: "#2e7d32", fontWeight: 500 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <KeyboardArrowDown sx={{ fontSize: 16 }} />
            Baja
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  )
}
