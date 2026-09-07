"use client"

import { useState, useRef } from "react"
import { Box, Chip, Popover, Typography, alpha } from "@mui/material"
import { useRouter } from "next/navigation"
import type { MedidaActivaBasica } from "../../types/legajo-api"

export const MedidasHoverChip = ({ count, medidas, legajoId }: { count: number; medidas: MedidaActivaBasica[]; legajoId: number }) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startClose = () => {
    closeTimer.current = setTimeout(() => setAnchorEl(null), 150)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    <>
      <Chip
        label={count}
        size="small"
        onMouseEnter={(e) => { cancelClose(); if (count > 0) setAnchorEl(e.currentTarget) }}
        onMouseLeave={startClose}
        sx={{
          minWidth: 32,
          height: 24,
          fontSize: "0.75rem",
          fontWeight: 600,
          cursor: count > 0 ? "pointer" : "default",
          bgcolor: count > 0 ? alpha("#3b82f6", 0.1) : "#f1f5f9",
          color: count > 0 ? "#2563eb" : "#94a3b8",
          border: count > 0 ? "1px solid #93c5fd" : "1px solid #e2e8f0",
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        disableRestoreFocus
        sx={{ pointerEvents: "none" }}
        PaperProps={{
          onMouseEnter: cancelClose,
          onMouseLeave: startClose,
          sx: { pointerEvents: "auto", py: 0.5, minWidth: 220, maxWidth: 300, boxShadow: 3 },
        }}
      >
        {medidas.map((m) => (
          <Box
            key={m.id}
            onClick={() => { setAnchorEl(null); router.push(`/legajo/${legajoId}/medida/${m.id}`) }}
            sx={{
              px: 1.5,
              py: 0.75,
              mx: 0.5,
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": { bgcolor: alpha("#3b82f6", 0.08) },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e40af", fontSize: "0.8rem" }}>
              {m.numero_medida}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              {m.tipo_medida}{m.etapa_actual__nombre ? ` · ${m.etapa_actual__nombre}` : ""}
            </Typography>
          </Box>
        ))}
      </Popover>
    </>
  )
}
