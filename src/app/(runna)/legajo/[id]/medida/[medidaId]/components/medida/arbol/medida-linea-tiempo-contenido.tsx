"use client"

/**
 * Contenido de la línea de tiempo de una medida (resumen + Timeline), sin
 * el chrome de página (breadcrumbs, botón volver). Extraído de
 * `medida-arbol-view.tsx` para poder reusarlo también embebido dentro de un
 * nodo expandible del árbol a nivel de LEGAJO (`legajo-arbol-view.tsx`), que
 * monta este mismo contenido por cada medida del legajo.
 */
import type React from "react"
import {
  Alert,
  Box,
  Chip,
  Skeleton,
  Stack,
  Typography,
  Paper,
} from "@mui/material"
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import { formatFechaSolo } from "../../../types/historial-seguimiento-api"
import { useLineaTiempoMedida } from "./use-linea-tiempo-medida"
import { MODULO_CONFIG } from "./modulo-config"

interface MedidaLineaTiempoContenidoProps {
  medidaId: number
  legajoId?: number
  /** Oculta el Paper de resumen (número, chips, etc.) cuando el contenedor externo ya lo muestra. */
  mostrarResumen?: boolean
}

export const MedidaLineaTiempoContenido: React.FC<MedidaLineaTiempoContenidoProps> = ({
  medidaId,
  legajoId,
  mostrarResumen = true,
}) => {
  const {
    isLoading,
    error,
    medida,
    resumen,
    totalActividades,
    totalInformes,
    items,
  } = useLineaTiempoMedida({ medidaId, legajoId, enabled: !!medidaId })

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar el árbol de la medida: {(error as Error).message}
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={90} />
        <Skeleton variant="rounded" height={80} />
        <Skeleton variant="rounded" height={80} />
      </Stack>
    )
  }

  if (!medida) return null

  return (
    <Box>
      {mostrarResumen && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <AccountTreeIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {medida.tipo_medida_display} {medida.numero_medida}
            </Typography>
            <Chip
              label={medida.estado_vigencia_display}
              size="small"
              color={medida.estado_vigencia === "VIGENTE" ? "primary" : "default"}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {items.length} registros en la línea de tiempo
            {resumen && ` · ${resumen.total_etapas} ${resumen.total_etapas === 1 ? "etapa" : "etapas"}`}
            {medida.duracion_dias !== undefined && ` · ${medida.duracion_dias} días de duración`}
            {` · ${totalActividades} ${totalActividades === 1 ? "actividad" : "actividades"}`}
            {` · ${totalInformes} ${totalInformes === 1 ? "informe mensual" : "informes mensuales"}`}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Ordenado de más viejo a más nuevo. Cada registro está etiquetado con su módulo y, si
            corresponde, su etapa — las actividades agrupan sus propios cambios en un detalle expandible.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            {Object.values(MODULO_CONFIG).map((config) => (
              <Chip
                key={config.label}
                label={config.label}
                size="small"
                sx={{ height: 22, fontSize: "0.7rem", bgcolor: config.backgroundColor, color: config.color }}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {items.length === 0 ? (
        <Alert severity="info">Todavía no hay registros para esta medida.</Alert>
      ) : (
        <Timeline position="right" sx={{ px: 0 }}>
          {items.map((item, idx) => {
            const config = MODULO_CONFIG[item.modulo]
            return (
              <TimelineItem key={item.id}>
                <TimelineOppositeContent sx={{ flex: 0.18, py: 2 }} variant="caption" color="text.secondary">
                  {formatFechaSolo(item.fecha)}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot sx={{ bgcolor: config.color, boxShadow: "none" }} />
                  {idx < items.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ py: 2, pr: 0 }}>
                  <Stack direction="row" spacing={0.75} sx={{ mb: 0.75 }} flexWrap="wrap" useFlexGap>
                    <Chip
                      label={config.label}
                      size="small"
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600, bgcolor: config.backgroundColor, color: config.color }}
                    />
                    {item.etapaLabel && (
                      <Chip label={item.etapaLabel} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.68rem" }} />
                    )}
                  </Stack>
                  {item.render()}
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      )}

    </Box>
  )
}
