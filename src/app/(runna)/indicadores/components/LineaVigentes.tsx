"use client"

/**
 * Línea de medidas vigentes acumuladas por mes, una serie por tipo de medida.
 * SVG a mano (no hay librería de gráficos en el proyecto): marca de 2px,
 * join/cap redondo, punto final >=8px con anillo de superficie, etiqueta de
 * valor en la punta de cada línea (ver `references/marks-and-anatomy.md`).
 * Sin tooltip de hover — simplificación deliberada para esta primera
 * versión: el valor final ya queda legible sin interacción.
 */
import type React from "react"
import { useMemo } from "react"
import { Box, Stack, Typography } from "@mui/material"
import type { PuntoSerieVigentes } from "../lib/serie-vigentes"
import { colorPorIndice } from "./paleta"
import { ORDEN_TIPO_MEDIDA } from "../lib/constantes"

interface LineaVigentesProps {
  data: PuntoSerieVigentes[]
}

const ANCHO = 760
const ALTO = 260
const MARGEN = { top: 16, right: 46, bottom: 28, left: 30 }
const GRIS_GRILLA = "#e1e0d9"
const GRIS_TEXTO = "#898781"

const formatearMes = (mes: string): string => {
  const [y, m] = mes.split("-")
  const nombres = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  return `${nombres[Number(m) - 1]}-${y.slice(2)}`
}

export const LineaVigentes: React.FC<LineaVigentesProps> = ({ data }) => {
  const { lineasPorTipo, yTicks, xPositions, innerWidth, innerHeight } = useMemo(() => {
    const innerWidth = ANCHO - MARGEN.left - MARGEN.right
    const innerHeight = ALTO - MARGEN.top - MARGEN.bottom
    const n = data.length

    const maxValor = Math.max(1, ...data.flatMap((d) => [d.MPI, d.MPE, d.MPJ]))
    const step = Math.max(1, Math.ceil(maxValor / 4))
    const niceMax = step * 4
    const yTicks = [0, step, step * 2, step * 3, niceMax]

    const xAt = (i: number) => (n <= 1 ? MARGEN.left + innerWidth / 2 : MARGEN.left + (i / (n - 1)) * innerWidth)
    const yAt = (v: number) => MARGEN.top + innerHeight - (v / niceMax) * innerHeight

    const xPositions = data.map((d, i) => ({ x: xAt(i), label: formatearMes(d.mes) }))

    const lineasPorTipo = (ORDEN_TIPO_MEDIDA as Array<"MPI" | "MPE" | "MPJ">).map((tipo, idx) => {
      const puntos = data.map((d, i) => ({ x: xAt(i), y: yAt(d[tipo]), valor: d[tipo] }))
      return { tipo, color: colorPorIndice(idx), puntos }
    })

    return { lineasPorTipo, yTicks, xPositions, innerWidth, innerHeight }
  }, [data])

  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled">
        Sin datos suficientes para calcular la evolución.
      </Typography>
    )
  }

  // Mostrar como mucho ~8 etiquetas de mes para que no se amontonen.
  const saltoEtiquetas = Math.max(1, Math.ceil(xPositions.length / 8))

  return (
    <Box>
      <Box component="svg" viewBox={`0 0 ${ANCHO} ${ALTO}`} sx={{ width: "100%", height: "auto", color: "text.primary" }}>
        {/* Gridlines horizontales (hairline, recesivas) */}
        {yTicks.map((tick) => {
          const y = MARGEN.top + innerHeight - (tick / yTicks[yTicks.length - 1]) * innerHeight
          return (
            <g key={tick}>
              <line x1={MARGEN.left} y1={y} x2={ANCHO - MARGEN.right} y2={y} stroke={GRIS_GRILLA} strokeWidth={1} />
              <text x={MARGEN.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={GRIS_TEXTO}>
                {tick}
              </text>
            </g>
          )
        })}

        {/* Eje X */}
        {xPositions.map((p, i) =>
          i % saltoEtiquetas === 0 || i === xPositions.length - 1 ? (
            <text key={p.label + i} x={p.x} y={ALTO - 8} textAnchor="middle" fontSize={10} fill={GRIS_TEXTO}>
              {p.label}
            </text>
          ) : null
        )}

        {/* Líneas por tipo de medida */}
        {lineasPorTipo.map(({ tipo, color, puntos }) => (
          <g key={tipo}>
            <polyline
              points={puntos.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Punto final: marcador >=8px con anillo de superficie */}
            <circle cx={puntos[puntos.length - 1].x} cy={puntos[puntos.length - 1].y} r={5} fill={color} stroke="#fcfcfb" strokeWidth={2} />
            {/* Etiqueta de valor en la punta */}
            <text
              x={puntos[puntos.length - 1].x + 8}
              y={puntos[puntos.length - 1].y}
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={700}
              fill="currentColor"
            >
              {puntos[puntos.length - 1].valor}
            </text>
          </g>
        ))}
      </Box>

      {/* Leyenda: la identidad nunca depende solo del color */}
      <Stack direction="row" spacing={2.5} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
        {lineasPorTipo.map(({ tipo, color }) => (
          <Stack key={tipo} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 14, height: 2, bgcolor: color, borderRadius: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {tipo}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}
