"use client"

import type React from "react"
import { Chip } from "@mui/material"

// Status chip component for better visual representation
export const StatusChip = ({ status, onClick }: { status: string; onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }) => {
  let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default"
  let label = status
  const isEvaluacion = status === "EVALUACION" || status === "PENDIENTE_AUTORIZACION"

  switch (status) {
    case "SIN_ASIGNAR":
      color = "default"
      label = "Sin Asignar"
      break
    case "CONSTATACION":
      color = "success"
      label = "Constatación"
      break
    case "EVALUACION":
      color = "info"
      label = "Evaluación"
      break
    case "PENDIENTE_AUTORIZACION":
      color = "warning"
      label = "Pendiente Autorización"
      break
    case "ARCHIVADA":
      color = "default"
      label = "Archivada"
      break
    case "ADMITIDA":
      color = "secondary"
      label = "Admitida"
      break
    case "RESPUESTA_SIN_ENVIAR":
      color = "error"
      label = "Respuesta Sin Enviar"
      break
    case "INFORME_SIN_ENVIAR":
      color = "warning"
      label = "Informe Sin Enviar"
      break
    case "REPUESTA_ENVIADA":
      color = "success"
      label = "Respuesta Enviada"
      break
    case "INFORME_ENVIADO":
      color = "info"
      label = "Informe Enviado"
      break
    case "PENDIENTE_SUBIR_PJ":
      color = "warning"
      label = "Listo para subir al PJ"
      break
    case "SUBIDO_A_PODER_JUDICIAL":
      color = "success"
      label = "Subido al PJ"
      break
    default:
      label = "Desconocido"
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
