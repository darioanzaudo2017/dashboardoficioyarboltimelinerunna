"use client"

/**
 * AdjuntosDelTecnico
 * Solo lectura: lo que el técnico cargó en la intervención de la etapa (informe obligatorio, notificaciones y actas,
 * documentación complementaria). Equipo Legal lo necesita a mano para redactar el informe jurídico.
 */

import type React from "react"
import { Alert, Box, Button, Chip, CircularProgress, Paper, Typography } from "@mui/material"
import { Description as DescriptionIcon, Download as DownloadIcon, FolderOpen as FolderOpenIcon } from "@mui/icons-material"
import { useQuery } from "@tanstack/react-query"
import { getAdjuntos } from "../../api/intervenciones-api-service"
import type { AdjuntoIntervencion, IntervencionResponse } from "../../types/intervencion-api"
import { formatDateTimeLocaleAR } from "@/utils/dateUtils"
import { agruparAdjuntosPorTipo } from "./agrupar-adjuntos"

interface AdjuntosDelTecnicoProps {
  medidaId: number
  /** Intervenciones de la etapa; se muestran los adjuntos de la más reciente. */
  intervenciones?: IntervencionResponse[]
}

export const AdjuntosDelTecnico: React.FC<AdjuntosDelTecnicoProps> = ({ medidaId, intervenciones = [] }) => {
  const intervencion = intervenciones[0]

  const { data: adjuntos = [], isLoading, isError } = useQuery({
    queryKey: ["adjuntos-del-tecnico", medidaId, intervencion?.id],
    queryFn: () => getAdjuntos(medidaId, intervencion!.id),
    enabled: Boolean(intervencion?.id),
  })

  if (!intervencion) return null

  const grupos = agruparAdjuntosPorTipo(adjuntos)

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }} data-testid="adjuntos-del-tecnico">
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <FolderOpenIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Documentos que cargó el técnico
        </Typography>
        <Chip label={intervencion.codigo_intervencion} size="small" variant="outlined" />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Son los archivos de la intervención de apertura. Descargalos para redactar el informe jurídico.
      </Typography>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={22} />
        </Box>
      )}

      {isError && <Alert severity="warning">No se pudieron cargar los documentos del técnico. Probá de nuevo más tarde.</Alert>}

      {!isLoading && !isError && grupos.length === 0 && (
        <Alert severity="info">El técnico todavía no adjuntó documentos en la intervención.</Alert>
      )}

      {grupos.map((grupo) => (
        <Box key={grupo.tipo} sx={{ mb: 1.5 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: "text.disabled", letterSpacing: "1px" }}>
            {grupo.titulo}
          </Typography>
          {grupo.adjuntos.map((adjunto) => (
            <Box
              key={adjunto.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: "none" },
              }}
            >
              <DescriptionIcon color="action" fontSize="small" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-word" }}>
                  {adjunto.nombre_original}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {adjunto.tamaño_mb ? `${adjunto.tamaño_mb} MB · ` : ""}
                  {adjunto.subido_por_detalle?.username ? `${adjunto.subido_por_detalle.username} · ` : ""}
                  {formatDateTimeLocaleAR(adjunto.fecha_subida)}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                href={adjunto.url_descarga}
                target="_blank"
                rel="noopener noreferrer"
              >
                Descargar
              </Button>
            </Box>
          ))}
        </Box>
      ))}
    </Paper>
  )
}
