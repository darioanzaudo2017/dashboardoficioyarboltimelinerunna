"use client"

/**
 * Torta/dona para desgloses de PARTE-DEL-TODO con pocas categorías (<=6) —
 * ver `references/anti-patterns.md` de la skill de dataviz: la torta solo
 * corresponde para "parte del todo de un vistazo", nunca para comparar
 * valores parecidos con precisión (para eso, barra). Se usa acá para género,
 * tipo de medida y disponibilidad de DNI — nunca para catálogos abiertos
 * (motivo, dispositivo), que quedan en `DesgloseBarras`.
 *
 * Dona hecha con conic-gradient (sin librería de gráficos, no hay ninguna
 * instalada en el proyecto). El hueco central muestra el total — la cifra
 * hace de "hero number" del gráfico.
 */
import type React from "react"
import { Box, Stack, Typography } from "@mui/material"
import type { ItemDesglose } from "../lib/agrupar"
import { colorPorIndice } from "./paleta"

interface DesglosePieProps {
  titulo: string
  data: ItemDesglose[]
  ordenColor?: string[]
  secundario?: (label: string) => number | undefined
  secundarioLabel?: string
  size?: number
}

export const DesglosePie: React.FC<DesglosePieProps> = ({
  titulo,
  data,
  ordenColor,
  secundario,
  secundarioLabel,
  size = 132,
}) => {
  const total = data.reduce((acc, d) => acc + d.value, 0)

  if (total === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Sin datos para este período.
        </Typography>
      </Box>
    )
  }

  let acumulado = 0
  const stops: string[] = []
  const conColor = data.map((item, idx) => {
    const colorIdx = ordenColor ? Math.max(ordenColor.indexOf(item.label), 0) : idx
    const color = colorPorIndice(colorIdx)
    const desde = (acumulado / total) * 360
    acumulado += item.value
    const hasta = (acumulado / total) * 360
    stops.push(`${color} ${desde}deg ${hasta}deg`)
    return { ...item, color }
  })

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
        {titulo}
      </Typography>
      <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
        <Box
          sx={{
            position: "relative",
            width: size,
            height: size,
            borderRadius: "50%",
            background: `conic-gradient(${stops.join(", ")})`,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: size * 0.28,
              borderRadius: "50%",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>
              {total}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
              total
            </Typography>
          </Box>
        </Box>

        <Stack spacing={0.6}>
          {conColor.map((item) => {
            const pct = Math.round((item.value / total) * 100)
            const valorSecundario = secundario?.(item.label)
            return (
              <Stack key={item.label} direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: item.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "text.primary" }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {item.value} ({pct}%)
                  {valorSecundario !== undefined && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      {" "}
                      · {valorSecundario} {secundarioLabel}
                    </Typography>
                  )}
                </Typography>
              </Stack>
            )
          })}
        </Stack>
      </Stack>
    </Box>
  )
}
