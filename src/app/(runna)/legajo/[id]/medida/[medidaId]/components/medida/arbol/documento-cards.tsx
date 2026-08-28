"use client"

/**
 * Tarjetas de los documentos reales de una etapa (intervención, nota de aval,
 * informe jurídico, ratificación), tal como los devuelve `getEtapaDetail`.
 * Cada tipo sabe cómo mostrar sus propios adjuntos: Ratificación los trae
 * embebidos; los demás se piden bajo demanda al expandir la tarjeta.
 */
import type React from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Chip,
  Collapse,
  Link,
  Stack,
  Typography,
} from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import PersonIcon from "@mui/icons-material/Person"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import { getAdjuntos as getAdjuntosIntervencion } from "../../../api/intervenciones-api-service"
import { getAdjuntosNotaAval } from "../../../api/nota-aval-api-service"
import { getAdjuntosInformeJuridico } from "../../../api/informe-juridico-api-service"
import type { IntervencionResponse } from "../../../types/intervencion-api"
import type { NotaAvalBasicResponse } from "../../../types/nota-aval-api"
import type { InformeJuridicoBasicResponse } from "../../../types/informe-juridico-api"
import type { RatificacionJudicial } from "../../../types/ratificacion-judicial-api"
import { extractUserName as extractDirectorName } from "../../../types/nota-aval-api"
import { extractUserName as extractLegalName } from "../../../types/informe-juridico-api"
import { formatFechaEvento } from "../../../types/historial-seguimiento-api"

export const estadoColor = (
  value: string
): "success" | "warning" | "error" | "default" | "info" => {
  const v = value.toUpperCase()
  if (["APROBADO", "APROBADA", "RATIFICADA", "COMPLETADO", "COMPLETADA", "VISADO_APROBADO"].includes(v)) return "success"
  if (["RECHAZADO", "RECHAZADA", "OBSERVADO", "NO_RATIFICADA", "VISADO_CON_OBSERVACION"].includes(v)) return "error"
  if (["PENDIENTE", "PENDIENTE_RATIFICACION", "BORRADOR", "EN_PROGRESO", "VENCIDO", "VENCIDA"].includes(v)) return "warning"
  return "default"
}

export interface DocCardShellProps {
  icon: React.ReactNode
  iconColor?: string
  titulo: string
  estadoLabel?: string
  fecha: string | null
  usuario?: string | null
  children?: React.ReactNode
}

export const DocCardShell: React.FC<DocCardShellProps> = ({
  icon,
  iconColor = "success.main",
  titulo,
  estadoLabel,
  fecha,
  usuario,
  children,
}) => (
  <Box
    sx={{
      p: 1.5,
      mb: 1,
      borderRadius: 1.5,
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
      <Box sx={{ color: iconColor, mt: 0.3 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {titulo}
          </Typography>
          {estadoLabel && (
            <Chip
              label={estadoLabel}
              size="small"
              color={estadoColor(estadoLabel)}
              variant="outlined"
              sx={{ height: 18, fontSize: "0.65rem" }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
          {fecha && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {formatFechaEvento(fecha)}
              </Typography>
            </Stack>
          )}
          {usuario && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PersonIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {usuario}
              </Typography>
            </Stack>
          )}
        </Stack>
        {children}
      </Box>
    </Stack>
  </Box>
)

interface AdjuntoLinkProps {
  href: string
  nombre: string
}

export const AdjuntoLink: React.FC<AdjuntoLinkProps> = ({ href, nombre }) => (
  <Stack direction="row" spacing={0.75} alignItems="center">
    <AttachFileIcon sx={{ fontSize: 14, color: "text.secondary" }} />
    <Link href={href} target="_blank" rel="noopener noreferrer" variant="caption" underline="hover">
      {nombre}
    </Link>
  </Stack>
)

/** Sección "Ver adjuntos" que pide la lista al expandirse (lazy). */
export const AdjuntosLazySection: React.FC<{
  queryKey: unknown[]
  queryFn: () => Promise<Array<{ id: number; nombre: string; href: string }>>
}> = ({ queryKey, queryFn }) => {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn,
    enabled: open,
    staleTime: 1000 * 60 * 2,
  })

  return (
    <Box sx={{ mt: 0.75 }}>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        onClick={() => setOpen((o) => !o)}
        sx={{ cursor: "pointer", width: "fit-content" }}
      >
        <ExpandMoreIcon
          sx={{ fontSize: 16, color: "text.secondary", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}
        />
        <Typography variant="caption" color="primary">
          Ver documentos adjuntos
        </Typography>
      </Stack>
      <Collapse in={open} unmountOnExit>
        <Stack spacing={0.5} sx={{ mt: 0.75, pl: 2.5 }}>
          {isLoading && (
            <Typography variant="caption" color="text.secondary">
              Cargando...
            </Typography>
          )}
          {!isLoading && data?.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Sin adjuntos.
            </Typography>
          )}
          {data?.map((adj) => (
            <AdjuntoLink key={adj.id} href={adj.href} nombre={adj.nombre} />
          ))}
        </Stack>
      </Collapse>
    </Box>
  )
}

// ============================================================================
// Intervención
// ============================================================================

export const IntervencionDocCard: React.FC<{ medidaId: number; intervencion: IntervencionResponse }> = ({
  medidaId,
  intervencion,
}) => {
  const usuario =
    intervencion.aprobado_por_detalle?.nombre_completo ??
    intervencion.registrado_por_detalle?.nombre_completo ??
    null

  return (
    <DocCardShell
      icon={<DescriptionIcon fontSize="small" />}
      titulo={`Intervención ${intervencion.codigo_intervencion}`}
      estadoLabel={intervencion.estado_display}
      fecha={intervencion.fecha_aprobacion ?? intervencion.fecha_envio ?? intervencion.fecha_creacion}
      usuario={usuario}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
        {intervencion.motivo_detalle?.nombre}
        {intervencion.categoria_intervencion_detalle?.nombre &&
          ` · ${intervencion.categoria_intervencion_detalle.nombre}`}
      </Typography>
      <AdjuntosLazySection
        queryKey={["arbol-adjuntos-intervencion", medidaId, intervencion.id]}
        queryFn={async () => {
          const adjuntos = await getAdjuntosIntervencion(medidaId, intervencion.id)
          return adjuntos.map((a) => ({ id: a.id, nombre: a.nombre_original, href: a.url_descarga }))
        }}
      />
    </DocCardShell>
  )
}

// ============================================================================
// Nota de Aval
// ============================================================================

export const NotaAvalDocCard: React.FC<{ medidaId: number; nota: NotaAvalBasicResponse }> = ({
  medidaId,
  nota,
}) => (
  <DocCardShell
    icon={<DescriptionIcon fontSize="small" />}
    titulo="Nota de Aval"
    estadoLabel={nota.decision_display}
    fecha={nota.fecha_emision}
    usuario={extractDirectorName(nota.emitido_por_detalle)}
  >
    <AdjuntosLazySection
      queryKey={["arbol-adjuntos-nota-aval", medidaId, nota.id]}
      queryFn={async () => {
        const adjuntos = await getAdjuntosNotaAval(medidaId, { nota_aval: nota.id })
        return adjuntos.map((a) => ({ id: a.id, nombre: a.nombre_archivo, href: a.archivo }))
      }}
    />
  </DocCardShell>
)

// ============================================================================
// Informe Jurídico
// ============================================================================

export const InformeJuridicoDocCard: React.FC<{ medidaId: number; informe: InformeJuridicoBasicResponse }> = ({
  medidaId,
  informe,
}) => (
  <DocCardShell
    icon={<DescriptionIcon fontSize="small" />}
    titulo="Informe Jurídico"
    estadoLabel={informe.enviado ? "Enviado" : "Borrador"}
    fecha={informe.fecha_envio ?? informe.fecha_notificaciones}
    usuario={extractLegalName(informe.elaborado_por_detalle)}
  >
    {(informe.tiene_informe_oficial || informe.cantidad_acuses > 0) && (
      <AdjuntosLazySection
        queryKey={["arbol-adjuntos-informe-juridico", medidaId, informe.id]}
        queryFn={async () => {
          const adjuntos = await getAdjuntosInformeJuridico(medidaId, { informe_juridico: informe.id })
          return adjuntos.map((a) => ({ id: a.id, nombre: a.nombre_original, href: a.archivo }))
        }}
      />
    )}
  </DocCardShell>
)

// ============================================================================
// Ratificación Judicial (los adjuntos vienen embebidos, sin fetch extra)
// ============================================================================

export const RatificacionDocCard: React.FC<{ ratificacion: RatificacionJudicial }> = ({ ratificacion }) => {
  const [open, setOpen] = useState(false)
  const adjuntos = ratificacion.adjuntos ?? []

  return (
    <DocCardShell
      icon={<DescriptionIcon fontSize="small" />}
      titulo="Ratificación Judicial"
      estadoLabel={ratificacion.decision}
      fecha={ratificacion.fecha_registro}
      usuario={ratificacion.usuario_registro_nombre}
    >
      {adjuntos.length > 0 && (
        <Box sx={{ mt: 0.75 }}>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            onClick={() => setOpen((o) => !o)}
            sx={{ cursor: "pointer", width: "fit-content" }}
          >
            <ExpandMoreIcon
              sx={{ fontSize: 16, color: "text.secondary", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}
            />
            <Typography variant="caption" color="primary">
              Ver documentos adjuntos ({adjuntos.length})
            </Typography>
          </Stack>
          <Collapse in={open} unmountOnExit>
            <Stack spacing={0.5} sx={{ mt: 0.75, pl: 2.5 }}>
              {adjuntos.map((a) => (
                <AdjuntoLink key={a.id} href={a.archivo_url} nombre={a.descripcion || a.tipo_adjunto} />
              ))}
            </Stack>
          </Collapse>
        </Box>
      )}
    </DocCardShell>
  )
}
