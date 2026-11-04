"use client"

import type React from "react"
import { Alert, Typography } from "@mui/material"
import { observacionDeRechazo } from "../../../utils/observacion-rechazo"
import type { EstadoIntervencion } from "../../../types/intervencion-api"

interface RechazoObservacionAlertProps {
  intervencion?: { estado?: EstadoIntervencion | string | null; observaciones_jz?: string | null } | null
  sx?: React.ComponentProps<typeof Alert>["sx"]
}

/** Aviso con el motivo del rechazo del Jefe Zonal. No muestra nada si la intervención no fue rechazada. */
export const RechazoObservacionAlert: React.FC<RechazoObservacionAlertProps> = ({ intervencion, sx }) => {
  const observacion = observacionDeRechazo(intervencion)
  if (!observacion) return null

  return (
    <Alert severity="warning" sx={sx}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        El Jefe Zonal rechazó la intervención
      </Typography>
      <Typography variant="body2">{observacion}</Typography>
    </Alert>
  )
}
