"use client"

/**
 * Nodo de una Actividad del Plan de Trabajo (PLTM-01) para el árbol de la
 * medida. Al expandir, arma cronológicamente todas las "acciones" ocurridas
 * dentro de la actividad (PLTM-02). Esto es la parte "recursiva" del árbol:
 * cada actividad es, en sí misma, un mini-timeline.
 *
 * OJO con la fuente de datos (mismo patrón que ya resolvió `useUnifiedActivity`):
 * - El listado de actividades (el que arma la línea de tiempo principal) NO
 *   trae `comentarios` confiablemente — hay que sacarlos del historial
 *   (`tipo_accion === 'COMENTARIO'`, texto en el campo `motivo`).
 * - Tampoco trae `adjuntos` de forma confiable — hay que pedir el detalle
 *   completo (`actividadService.get(id)`) para tenerlos.
 * Ambos se piden recién al expandir, no en la carga inicial de la línea de tiempo.
 */
import type React from "react"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import AssignmentIcon from "@mui/icons-material/Assignment"
import PersonIcon from "@mui/icons-material/Person"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import CommentIcon from "@mui/icons-material/Comment"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
import HistoryIcon from "@mui/icons-material/History"
import { extractArray } from "@/hooks/useApiQuery"
import { actividadService } from "../../../services/actividadService"
import type { TActividadPlanTrabajo, THistorialActividad, TTransferenciaActividad } from "../../../types/actividades"
import { getActorColor, ACTOR_LABELS } from "../../../types/actividades"
import { formatFechaEvento, getRelativeTime } from "../../../types/historial-seguimiento-api"
import { estadoColor } from "./documento-cards"

interface AccionItem {
  id: string
  fecha: string
  icon: React.ReactNode
  texto: string
  usuario?: string
}

const descripcionHistorial = (h: THistorialActividad): string => {
  switch (h.tipo_accion) {
    case "CREACION":
      return "Actividad creada"
    case "CAMBIO_ESTADO":
      return `Cambio de estado: ${h.estado_anterior ?? "?"} → ${h.estado_nuevo ?? "?"}`
    case "EDICION_CAMPOS":
      return `Edición de campos${
        h.campos_modificados ? `: ${Object.keys(h.campos_modificados).join(", ")}` : ""
      }`
    case "REAPERTURA":
      return `Actividad reabierta${h.motivo ? ` — ${h.motivo}` : ""}`
    case "ASIGNACION":
      return "Reasignación de responsables"
    case "VISADO_APROBADO":
      return "Visado aprobado"
    case "VISADO_RECHAZADO":
      return `Visado con observación${h.observaciones ? `: ${h.observaciones}` : ""}`
    default:
      return h.tipo_accion
  }
}

// ADJUNTO_AGREGADO y TRANSFERENCIA ya se muestran vía el detalle de la
// actividad y vía `getTransferencias` respectivamente — se excluyen acá para
// no duplicar. COMENTARIO NO se excluye: es la única fuente confiable de
// comentarios (se transforma más abajo).
const TIPOS_HISTORIAL_YA_CUBIERTOS = new Set(["ADJUNTO_AGREGADO", "TRANSFERENCIA"])

export const ActividadNode: React.FC<{ actividad: TActividadPlanTrabajo }> = ({ actividad }) => {
  const [expanded, setExpanded] = useState(false)

  const { data: historial, isLoading: loadingHistorial } = useQuery({
    queryKey: ["arbol-actividad-historial", actividad.id],
    queryFn: () => actividadService.getHistorial(actividad.id),
    enabled: expanded,
    staleTime: 1000 * 60 * 2,
  })

  const { data: transferencias, isLoading: loadingTransferencias } = useQuery({
    queryKey: ["arbol-actividad-transferencias", actividad.id],
    queryFn: () => actividadService.getTransferencias(actividad.id),
    enabled: expanded,
    staleTime: 1000 * 60 * 2,
  })

  // Detalle completo (no el de listado) — es la única fuente confiable de adjuntos.
  const { data: actividadDetalle, isLoading: loadingDetalle } = useQuery({
    queryKey: ["arbol-actividad-detalle", actividad.id],
    queryFn: () => actividadService.get(actividad.id),
    enabled: expanded,
    staleTime: 1000 * 60 * 2,
  })

  const acciones = useMemo<AccionItem[]>(() => {
    const items: AccionItem[] = []
    const historialArray = extractArray<THistorialActividad>(historial)

    for (const a of actividadDetalle?.adjuntos ?? []) {
      items.push({
        id: `a-${a.id}`,
        fecha: a.fecha_subida,
        icon: <AttachFileIcon sx={{ fontSize: 14 }} />,
        texto: `Adjunto: ${a.nombre_original} (${a.tipo_adjunto_display})`,
        usuario: a.usuario_carga.nombre_completo,
      })
    }

    for (const h of historialArray) {
      if (TIPOS_HISTORIAL_YA_CUBIERTOS.has(h.tipo_accion)) continue
      if (h.tipo_accion === "COMENTARIO") {
        items.push({
          id: `c-${h.id}`,
          fecha: h.fecha_accion,
          icon: <CommentIcon sx={{ fontSize: 14 }} />,
          texto: `Comentario: "${h.motivo ?? ""}"`,
          usuario: h.usuario?.nombre_completo,
        })
        continue
      }
      items.push({
        id: `h-${h.id}`,
        fecha: h.fecha_accion,
        icon: <HistoryIcon sx={{ fontSize: 14 }} />,
        texto: descripcionHistorial(h),
        usuario: h.usuario?.nombre_completo,
      })
    }

    for (const t of extractArray<TTransferenciaActividad>(transferencias)) {
      items.push({
        id: `t-${t.id}`,
        fecha: t.fecha_transferencia,
        icon: <SwapHorizIcon sx={{ fontSize: 14 }} />,
        texto: `Transferida${t.motivo ? ` — ${t.motivo}` : ""}`,
        usuario: t.transferido_por_info?.nombre_completo,
      })
    }

    return items.sort((x, y) => new Date(x.fecha).getTime() - new Date(y.fecha).getTime())
  }, [actividadDetalle, historial, transferencias])

  const isLoadingAcciones = expanded && (loadingHistorial || loadingTransferencias || loadingDetalle)
  // Las actividades de tipo Oficio no tienen subtipo (solo derecho_principal/
  // tipo_actividad), así que ahí el nombre completo vive en derecho_principal.
  // Cuando sí hay subtipo (actividades normales), se muestran los dos:
  // "Derecho Principal — Subtipo específico".
  const nombrePrincipal =
    actividad.derecho_principal_info?.nombre ?? actividad.tipo_actividad_info?.nombre ?? "Actividad"
  const nombreActividad = actividad.subtipo_actividad_info?.nombre
    ? `${nombrePrincipal} — ${actividad.subtipo_actividad_info.nombre}`
    : nombrePrincipal

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded((e) => !e)}
      disableGutters
      sx={{
        mb: 1,
        borderRadius: "8px !important",
        border: "1px solid",
        borderColor: "divider",
        "&:before": { display: "none" },
        overflow: "hidden",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <AssignmentIcon sx={{ fontSize: 16, color: getActorColor(actividad.actor) }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {nombreActividad}
            </Typography>
            <Chip
              label={actividad.estado_display}
              size="small"
              color={estadoColor(actividad.estado)}
              variant="outlined"
              sx={{ height: 18, fontSize: "0.65rem" }}
            />
            <Chip
              label={ACTOR_LABELS[actividad.actor]}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.65rem",
                bgcolor: `${getActorColor(actividad.actor)}22`,
                color: getActorColor(actividad.actor),
              }}
            />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {formatFechaEvento(actividad.fecha_creacion)}
              </Typography>
            </Stack>
            {actividad.responsable_principal_info && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PersonIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {actividad.responsable_principal_info.nombre_completo || actividad.responsable_principal_info.username}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ bgcolor: "grey.50" }}>
        {isLoadingAcciones && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              Cargando acciones...
            </Typography>
          </Stack>
        )}
        {!isLoadingAcciones && acciones.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            Sin acciones registradas sobre esta actividad.
          </Typography>
        )}
        <Stack spacing={1}>
          {acciones.map((accion) => (
            <Stack key={accion.id} direction="row" spacing={1} alignItems="flex-start">
              <Box sx={{ color: "text.secondary", mt: 0.3 }}>{accion.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ display: "block" }}>
                  {accion.texto}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {getRelativeTime(accion.fecha)}
                  {accion.usuario && ` · ${accion.usuario}`}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
