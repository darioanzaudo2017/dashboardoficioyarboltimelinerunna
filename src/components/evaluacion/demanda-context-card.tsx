"use client"

import Link from "next/link"
import { Box, Button, Chip, Paper, Typography } from "@mui/material"
import { ArrowBack as ArrowBackIcon, Person as PersonIcon } from "@mui/icons-material"

interface DemandaContextCardProps {
  /** Raw API data from registro-demanda-form/{id}/full-detail/ */
  apiData: any
}

const formatUnderscoreText = (text?: string | null): string => {
  if (!text) return ""
  return text
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const ESTADO_CHIP_COLOR: Record<string, "default" | "primary" | "info" | "warning" | "success" | "error"> = {
  SIN_ASIGNAR: "default",
  CONSTATACION: "info",
  EVALUACION: "primary",
  PENDIENTE_AUTORIZACION: "warning",
  ADMITIDA: "success",
  ARCHIVADA: "error",
}

/**
 * Card de contexto fija al tope de la evaluación: recuerda en qué demanda
 * se está trabajando y ofrece un link directo de vuelta a la demanda en
 * la Mesa de Entradas (deep-link ?demanda=ID).
 */
export default function DemandaContextCard({ apiData }: DemandaContextCardProps) {
  if (!apiData?.id) return null

  // NNyA principal: persona nnya cuyo demanda_persona no tiene vínculo con el principal
  const personas: any[] = Array.isArray(apiData.personas) ? apiData.personas : []
  const nnyas = personas.filter((p) => p?.persona?.nnya === true)
  const principal =
    nnyas.find((p) => !p?.demanda_persona?.vinculo_con_nnya_principal) || nnyas[0] || null

  const nombrePrincipal = principal
    ? `${principal.persona?.apellido || ""}, ${principal.persona?.nombre || ""}`.replace(/^, |, $/g, "")
    : null

  const estado = apiData.estado_demanda as string | undefined
  const fechaIngreso = apiData.fecha_ingreso_senaf
    ? new Date(`${apiData.fecha_ingreso_senaf}T00:00:00`).toLocaleDateString("es-AR")
    : null

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "4px solid #0EA5E9",
        borderRadius: 2,
        backgroundColor: "rgba(14, 165, 233, 0.04)",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0EA5E9", lineHeight: 1.2 }}>
            Evaluación — Demanda #{apiData.id}
          </Typography>
          {estado && (
            <Chip
              label={formatUnderscoreText(estado)}
              size="small"
              color={ESTADO_CHIP_COLOR[estado] || "default"}
              variant="outlined"
            />
          )}
          {apiData.objetivo_de_demanda && (
            <Chip
              label={formatUnderscoreText(apiData.objetivo_de_demanda)}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {nombrePrincipal && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                NNyA principal: <strong>{nombrePrincipal}</strong>
                {principal?.persona?.dni ? ` (DNI ${principal.persona.dni})` : ""}
              </Typography>
            </Box>
          )}
          {fechaIngreso && (
            <Typography variant="body2" color="text.secondary">
              Ingreso SENAF: {fechaIngreso}
            </Typography>
          )}
        </Box>
      </Box>

      <Button
        component={Link}
        href={`/mesadeentrada?demanda=${apiData.id}`}
        variant="outlined"
        size="small"
        startIcon={<ArrowBackIcon />}
        sx={{ textTransform: "none", whiteSpace: "nowrap", alignSelf: { xs: "flex-start", sm: "center" } }}
      >
        Volver a la demanda
      </Button>
    </Paper>
  )
}
