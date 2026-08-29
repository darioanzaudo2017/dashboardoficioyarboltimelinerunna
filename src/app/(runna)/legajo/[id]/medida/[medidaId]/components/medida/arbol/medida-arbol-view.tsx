"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Alert, Box, Button } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import {
  getDefaultBreadcrumbs,
  NavigationBreadcrumbs,
} from "../../navigation-breadcrumbs"
import { MedidaLineaTiempoContenido } from "./medida-linea-tiempo-contenido"

interface MedidaArbolViewProps {
  legajoId: string
  medidaId: string
}

export const MedidaArbolView: React.FC<MedidaArbolViewProps> = ({ legajoId, medidaId }) => {
  const router = useRouter()
  const medidaIdNum = Number(medidaId)
  const parsedLegajoId = Number(legajoId)
  const legajoIdNum = Number.isInteger(parsedLegajoId) && parsedLegajoId > 0 ? parsedLegajoId : undefined
  const isValidMedidaId = Number.isInteger(medidaIdNum) && medidaIdNum > 0

  const handleBack = () => {
    router.push(`/legajo/${legajoId}/medida/${medidaId}`)
  }

  const breadcrumbItems = [
    ...getDefaultBreadcrumbs(),
    { label: `Legajo ${legajoId}`, path: `/legajo/${legajoId}` },
    { label: "Medida", path: `/legajo/${legajoId}/medida/${medidaId}` },
  ]

  if (!isValidMedidaId) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        ID de medida inválido: &quot;{medidaId}&quot;
      </Alert>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ mb: 2 }}>
        <NavigationBreadcrumbs items={breadcrumbItems} currentPage="Árbol de la Medida" />
      </Box>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        size="small"
        sx={{ mb: 2, textTransform: "none" }}
      >
        Volver a la medida
      </Button>

      <MedidaLineaTiempoContenido medidaId={medidaIdNum} legajoId={legajoIdNum} />
    </Box>
  )
}
