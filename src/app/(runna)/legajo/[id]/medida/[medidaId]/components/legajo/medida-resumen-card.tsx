"use client"

import type React from "react"
import { useMemo } from "react"
import { Alert, Box, Button, Chip, Paper, Skeleton, Tooltip, Typography } from "@mui/material"
import GroupsIcon from "@mui/icons-material/Groups"
import EventIcon from "@mui/icons-material/Event"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import { useQuery } from "@tanstack/react-query"
import { extractArray } from "@/hooks/useApiQuery"
import { globalActividadService } from "@/app/(runna)/legajo/actividades/services/globalActividadService"
import type { MedidaBasicResponse } from "@/app/(runna)/legajo-mesa/types/medida-api"
import { resumirActividades, type ActividadDestacada, type ActividadParaResumen } from "./medida-resumen"
import { formatDateLocaleAR, toDateObject } from "@/utils/dateUtils"

interface MedidaResumenCardProps {
  medida: MedidaBasicResponse
  legajoId: number
  /** Números de otras medidas vigentes del mismo tipo (para avisar de posibles duplicadas). */
  otrasVigentes?: string[]
  esCompartida?: boolean
  onVerMedida: () => void
  onVerPlanTrabajo?: () => void
}

const COLOR_TIPO: Record<string, string> = { MPI: "#1976d2", MPE: "#2e7d32", MPJ: "#ed6c02" }

const textoDe = (valor: any, vacio = ""): string => {
  if (typeof valor === "string") return valor
  if (valor && typeof valor === "object") return String(valor.display ?? valor.nombre ?? vacio)
  return vacio
}

// Las fechas sin hora (ej. fecha de cierre) no pueden pasar por new Date(): se corren un día en Argentina.
const formatFecha = (iso: string | null | undefined): string => {
  if (!iso) return "—"
  const d = toDateObject(iso)
  return Number.isNaN(d.getTime()) ? "—" : formatDateLocaleAR(d)
}

const Destacada: React.FC<{ icono: React.ReactNode; rotulo: string; dato: ActividadDestacada | null; vacio: string }> = ({
  icono,
  rotulo,
  dato,
  vacio,
}) => (
  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", minWidth: 0 }}>
    <Box sx={{ color: "text.secondary", display: "flex", mt: 0.25 }}>{icono}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {rotulo}
      </Typography>
      {dato ? (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {formatFecha(dato.fecha)} · {dato.titulo}
          {dato.actor ? <Typography component="span" variant="body2" color="text.secondary"> ({dato.actor})</Typography> : null}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {vacio}
        </Typography>
      )}
    </Box>
  </Box>
)

/** Un tramo de la barra de avance: ancho proporcional a la cantidad. */
const Tramo: React.FC<{ cantidad: number; total: number; color: string; titulo: string }> = ({ cantidad, total, color, titulo }) =>
  cantidad > 0 ? (
    <Tooltip title={`${titulo}: ${cantidad}`}>
      <Box sx={{ width: `${(cantidad / total) * 100}%`, bgcolor: color, minWidth: 4 }} />
    </Tooltip>
  ) : null

export const MedidaResumenCard: React.FC<MedidaResumenCardProps> = ({
  medida,
  legajoId,
  otrasVigentes = [],
  esCompartida = false,
  onVerMedida,
  onVerPlanTrabajo,
}) => {
  const tipo = textoDe(medida.tipo_medida, "N/A")
  const vigente = medida.estado_vigencia === "VIGENTE"

  const { data, isLoading, error } = useQuery({
    queryKey: ["resumen-medida", legajoId, medida.id],
    queryFn: () => globalActividadService.list({ legajo: legajoId, medida: medida.id, page_size: 200 }),
    staleTime: 2 * 60 * 1000,
  })

  const resumen = useMemo(
    () => (data ? resumirActividades(extractArray<ActividadParaResumen>(data as any)) : null),
    [data],
  )

  const equipos = resumen ? Object.entries(resumen.porEquipo) : []

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderLeft: `5px solid ${COLOR_TIPO[tipo] ?? "#757575"}`,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        opacity: vigente ? 1 : 0.85,
      }}
    >
      {/* Encabezado: qué medida es y en qué estado está */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Chip label={tipo} size="small" sx={{ fontWeight: "bold", bgcolor: COLOR_TIPO[tipo] ?? "grey.600", color: "#fff" }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {textoDe(medida.numero_medida, "N/A")}
        </Typography>
        <Chip
          label={medida.estado_vigencia === "VIGENTE" ? "Vigente" : textoDe(medida.estado_vigencia_display ?? medida.estado_vigencia, "N/A")}
          size="small"
          color={vigente ? "success" : "default"}
          variant="outlined"
        />
        {esCompartida && <Chip icon={<GroupsIcon />} label="Compartida" size="small" color="info" variant="outlined" />}
        {medida.etapa_actual?.estado_display && (
          <Chip label={`Etapa: ${medida.etapa_actual.estado_display}`} size="small" variant="outlined" sx={{ ml: { sm: "auto" } }} />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5 }}>
        Apertura {formatFecha(medida.fecha_apertura)}
        {medida.fecha_cierre ? ` · Cierre ${formatFecha(medida.fecha_cierre)}` : ""} · {medida.duracion_dias}{" "}
        {medida.duracion_dias === 1 ? "día" : "días"}
      </Typography>

      {otrasVigentes.length > 0 && (
        <Alert severity="warning" sx={{ py: 0 }}>
          Hay otra medida vigente del mismo tipo: {otrasVigentes.join(", ")}. Revisá que no esté duplicada.
        </Alert>
      )}

      {/* Qué se hizo: actividades por estado */}
      {isLoading && (
        <Box>
          <Skeleton variant="rounded" height={12} />
          <Skeleton width="60%" sx={{ mt: 1 }} />
        </Box>
      )}
      {error && (
        <Typography variant="body2" color="text.secondary">
          No se pudieron cargar las actividades de esta medida.
        </Typography>
      )}
      {resumen && resumen.total === 0 && (
        <Typography variant="body2" color="text.secondary">
          Todavía no hay actividades en el plan de trabajo de esta medida.
        </Typography>
      )}
      {resumen && resumen.total > 0 && (
        <>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {resumen.realizadas} de {resumen.total} actividades completadas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {resumen.avance}%
              </Typography>
            </Box>
            <Box sx={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", bgcolor: "grey.200" }}>
              <Tramo cantidad={resumen.realizadas} total={resumen.total} color="#2e7d32" titulo="Realizadas" />
              <Tramo cantidad={resumen.porVisar} total={resumen.total} color="#0288d1" titulo="Por visar" />
              <Tramo cantidad={resumen.enProgreso} total={resumen.total} color="#1976d2" titulo="En progreso" />
              <Tramo cantidad={resumen.pendientesEnPlazo} total={resumen.total} color="#9e9e9e" titulo="Pendientes en plazo" />
              <Tramo cantidad={resumen.vencidas} total={resumen.total} color="#d32f2f" titulo="Vencidas" />
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1 }}>
              {resumen.pendientes > 0 && <Chip size="small" label={`${resumen.pendientes} pendientes`} />}
              {resumen.realizadas > 0 && <Chip size="small" color="success" variant="outlined" label={`${resumen.realizadas} realizadas`} />}
              {resumen.enProgreso > 0 && <Chip size="small" color="primary" variant="outlined" label={`${resumen.enProgreso} en progreso`} />}
              {resumen.porVisar > 0 && <Chip size="small" color="info" variant="outlined" label={`${resumen.porVisar} por visar`} />}
              {resumen.vencidas > 0 && <Chip size="small" color="error" label={`${resumen.vencidas} vencidas`} />}
              {resumen.canceladas > 0 && <Chip size="small" variant="outlined" label={`${resumen.canceladas} canceladas`} />}
            </Box>
          </Box>

          {equipos.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
              <Typography variant="caption" color="text.secondary">
                Equipos:
              </Typography>
              {equipos.map(([equipo, cantidad]) => (
                <Chip key={equipo} size="small" variant="outlined" label={`${equipo} ${cantidad}`} />
              ))}
            </Box>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
            <Destacada
              icono={<CheckCircleOutlineIcon fontSize="small" />}
              rotulo="Última actividad realizada"
              dato={resumen.ultimaRealizada}
              vacio="Todavía no se realizó ninguna"
            />
            <Destacada
              icono={<EventIcon fontSize="small" />}
              rotulo="Próxima actividad planificada"
              dato={resumen.proxima}
              vacio="No hay actividades próximas"
            />
          </Box>
        </>
      )}

      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {onVerPlanTrabajo && (
          <Button size="small" onClick={onVerPlanTrabajo} sx={{ textTransform: "none" }}>
            Ver plan de trabajo
          </Button>
        )}
        <Button size="small" variant="outlined" onClick={onVerMedida} sx={{ textTransform: "none" }}>
          Ver medida
        </Button>
      </Box>
    </Paper>
  )
}
