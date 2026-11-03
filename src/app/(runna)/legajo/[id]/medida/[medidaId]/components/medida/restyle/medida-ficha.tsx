"use client"

/**
 * Franja compacta con lo primero que se busca al abrir una medida: de quién es (NNyA y legajo), quién la lleva
 * (equipo responsable) y, para MPE vigentes, cuánto del plazo legal de 90 días ya pasó.
 */
import type React from "react"
import { Box, Chip, Typography } from "@mui/material"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline"
import { MEDIDA_COLORS } from "./medida-theme"
import { calcularPlazoMedida, PLAZO_MPE_DIAS, type EstadoPlazo } from "../../../utils/plazo-medida"

interface MedidaFichaProps {
  /** Nombre del NNyA (apellido y nombre). */
  nombre?: string
  numeroLegajo?: string
  equipoResponsable?: string
  /** Solo para MPE: fecha de creación de la medida, para el plazo de 90 días. */
  fechaCreacionPlazo?: string | null
  /** El plazo solo se muestra mientras la medida está vigente. */
  vigente?: boolean
}

const COLOR_PLAZO: Record<EstadoPlazo, { barra: string; texto: string }> = {
  normal: { barra: "#12B76A", texto: "#027A48" },
  warning: { barra: "#F79009", texto: "#B54708" },
  critical: { barra: "#D92D20", texto: "#B42318" },
  exceeded: { barra: "#D92D20", texto: "#B42318" },
}

export const MedidaFicha: React.FC<MedidaFichaProps> = ({
  nombre,
  numeroLegajo,
  equipoResponsable,
  fechaCreacionPlazo,
  vigente,
}) => {
  const plazo = vigente ? calcularPlazoMedida(fechaCreacionPlazo) : null
  if (!nombre && !equipoResponsable && !plazo) return null

  const colores = plazo ? COLOR_PLAZO[plazo.estado] : null

  return (
    <Box
      sx={{
        mb: 2,
        px: { xs: "12px", sm: "16px" },
        py: "10px",
        borderRadius: "10px",
        border: `1px solid ${MEDIDA_COLORS.border}`,
        bgcolor: MEDIDA_COLORS.surface,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        columnGap: 3,
        rowGap: 1,
      }}
    >
      {nombre && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <PersonOutlineIcon sx={{ fontSize: 20, color: MEDIDA_COLORS.text3 }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: MEDIDA_COLORS.text, textTransform: "capitalize" }} noWrap>
            {nombre}
          </Typography>
          {numeroLegajo && (
            <Chip label={numeroLegajo} size="small" variant="outlined" sx={{ height: 20, fontSize: 11, fontWeight: 600 }} />
          )}
        </Box>
      )}

      {equipoResponsable && (
        <Typography sx={{ fontSize: 12, color: MEDIDA_COLORS.text3 }}>
          Equipo responsable: <strong style={{ color: MEDIDA_COLORS.text2 }}>{equipoResponsable}</strong>
        </Typography>
      )}

      {plazo && colores && (
        <Box
          sx={{ ml: { xs: 0, md: "auto" }, display: "flex", alignItems: "center", gap: 1.5, width: { xs: "100%", md: "auto" } }}
          title={`Plazo legal de ${PLAZO_MPE_DIAS} días desde la creación de la medida`}
        >
          <Typography sx={{ fontSize: 12, color: MEDIDA_COLORS.text3, whiteSpace: "nowrap" }}>
            Plazo {plazo.diasTranscurridos}/{PLAZO_MPE_DIAS} días
          </Typography>
          <Box sx={{ flex: { xs: 1, md: "none" }, width: { md: 120 }, height: 6, bgcolor: MEDIDA_COLORS.border, borderRadius: "3px", overflow: "hidden" }}>
            <Box sx={{ width: `${plazo.porcentaje}%`, height: "100%", bgcolor: colores.barra }} />
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: colores.texto, whiteSpace: "nowrap" }}>
            {plazo.estado === "exceeded" ? "Plazo vencido" : `${plazo.diasRestantes} días restantes`}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
