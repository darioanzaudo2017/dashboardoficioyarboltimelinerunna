"use client"

import type React from "react"
import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material"

interface IndicadorCardProps {
  /** Ej. "IP1" o "IP10 / IP11" cuando el card combina el par medidas+NNyA. */
  codigo: string
  titulo: string
  /** Número principal a mostrar grande (cantidad total). */
  total?: number
  totalLabel?: string
  children?: React.ReactNode
}

export const IndicadorCard: React.FC<IndicadorCardProps> = ({ codigo, titulo, total, totalLabel, children }) => (
  <Paper
    elevation={0}
    sx={{ p: 2.5, mb: 2.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
  >
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
      <Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={codigo}
            size="small"
            sx={{ fontWeight: 700, bgcolor: "primary.main", color: "#fff", height: 22 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {titulo}
          </Typography>
        </Stack>
      </Box>
      {total !== undefined && (
        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1, color: "primary.main" }}>
            {total}
          </Typography>
          {totalLabel && (
            <Typography variant="caption" color="text.secondary">
              {totalLabel}
            </Typography>
          )}
        </Box>
      )}
    </Stack>
    {children && (
      <>
        <Divider sx={{ mb: 1.5 }} />
        {children}
      </>
    )}
  </Paper>
)

interface IndicadorNoDisponibleProps {
  codigo: string
  titulo: string
  motivo: string
}

export const IndicadorNoDisponible: React.FC<IndicadorNoDisponibleProps> = ({ codigo, titulo, motivo }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      mb: 2.5,
      borderRadius: 2,
      border: "1px dashed",
      borderColor: "divider",
      bgcolor: "action.hover",
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
      <Chip label={codigo} size="small" sx={{ fontWeight: 700, height: 22 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.secondary" }}>
        {titulo}
      </Typography>
      <Chip label="No disponible" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
    </Stack>
    <Typography variant="body2" color="text.secondary">
      {motivo}
    </Typography>
  </Paper>
)
