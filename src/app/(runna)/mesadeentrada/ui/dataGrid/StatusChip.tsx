"use client"

import type React from "react"
import { Chip } from "@mui/material"
import { ESTADO_DEMANDA_LABELS } from "@/utils/demandaLabels"

// Status chip component for better visual representation
export const StatusChip = ({ status, onClick }: { status: string; onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }) => {
  let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default"
  // Los nombres viven en un solo lugar (utils/demandaLabels); acá sólo se decide el color
  const label = ESTADO_DEMANDA_LABELS[status] ?? "Desconocido"
  const isEvaluacion = status === "EVALUACION" || status === "PENDIENTE_AUTORIZACION"

  switch (status) {
    case "SIN_ASIGNAR":
      color = "default"
      break
    case "CONSTATACION":
      color = "success"
      break
    case "EVALUACION":
      color = "info"
      break
    case "PENDIENTE_AUTORIZACION":
      color = "warning"
      break
    case "ARCHIVADA":
      color = "default"
      break
    case "ADMITIDA":
      color = "secondary"
      break
    case "RESPUESTA_SIN_ENVIAR":
      color = "error"
      break
    case "INFORME_SIN_ENVIAR":
      color = "warning"
      break
    case "REPUESTA_ENVIADA":
      color = "success"
      break
    case "INFORME_ENVIADO":
      color = "info"
      break
    case "PENDIENTE_SUBIR_PJ":
      color = "warning"
      break
    case "SUBIDO_A_PODER_JUDICIAL":
      color = "success"
      break
    default:
      break
  }

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      variant={isEvaluacion ? "filled" : "outlined"}
      onClick={isEvaluacion ? onClick : undefined}
      sx={{
        fontWeight: 600,
        cursor: isEvaluacion ? "pointer" : "default",
        transition: "all 0.2s",
        "&:hover": isEvaluacion ? {
          backgroundColor: "info.dark",
          transform: "scale(1.05)",
          boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)",
        } : {},
        "& .MuiChip-label": {
          px: 1,
        },
        margin: "0 auto",
        display: "flex",
      }}
    />
  )
}
