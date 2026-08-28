"use client"

/**
 * Desglose categórico como barras horizontales: marca delgada, extremo
 * redondeado, etiqueta de valor directa (no requiere hover para leer el
 * número — ver `references/marks-and-anatomy.md` de la skill de dataviz).
 */
import type React from "react"
import { Box, Stack, Typography } from "@mui/material"
import type { ItemDesglose } from "../lib/agrupar"
import { colorPorIndice } from "./paleta"

interface DesgloseBarrasProps {
  titulo: string
  data: ItemDesglose[]
  /** Etiqueta secundaria opcional por fila (ej. cantidad de NNyA junto a cantidad de medidas). */
  secundario?: (label: string) => number | undefined
  secundarioLabel?: string
  /**
   * Orden fijo de categorías conocidas (ej. género, tipo de medida) para que
   * el color siga a la categoría y no a su posición en el ranking — así
   * "MASCULINO" es siempre el mismo color en todos los gráficos, sin
   * importar si en este desglose quedó primero o tercero.
   */
  ordenColor?: string[]
}

export const DesgloseBarras: React.FC<DesgloseBarrasProps> = ({
  titulo,
  data,
  secundario,
  secundarioLabel,
  ordenColor,
}) => {
  if (data.length === 0) {
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

  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.75 }}>
        {titulo}
      </Typography>
      <Stack spacing={0.75}>
        {data.map((item, idx) => {
          const pct = Math.max((item.value / max) * 100, 3)
          const valorSecundario = secundario?.(item.label)
          const colorIdx = ordenColor ? Math.max(ordenColor.indexOf(item.label), 0) : idx
          return (
            <Box key={item.label}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                <Typography variant="caption" sx={{ color: "text.primary" }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {item.value}
                  {valorSecundario !== undefined && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      {" "}
                      ({valorSecundario} {secundarioLabel})
                    </Typography>
                  )}
                </Typography>
              </Stack>
              <Box sx={{ height: 8, bgcolor: "action.hover", borderRadius: 4, overflow: "hidden" }}>
                <Box
                  sx={{
                    height: "100%",
                    width: `${pct}%`,
                    bgcolor: colorPorIndice(colorIdx),
                    borderRadius: 4,
                    transition: "width .3s ease",
                  }}
                />
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
