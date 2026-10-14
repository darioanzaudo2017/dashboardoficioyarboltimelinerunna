"use client"

/**
 * Calendario de actividades de Plan de Trabajo + Control de Legalidad para
 * una medida. Un solo módulo (no dos separados) porque ambos equipos
 * comparten el mismo plan_trabajo y lo que el usuario quiere ver acá es
 * "qué vence cuándo", sin importar qué equipo lo tiene asignado — para eso
 * están los colores por equipo.
 *
 * Se ubica por `fecha_planificacion` (la misma fecha que ya se muestra como
 * "Fecha Plan." en la tabla de actividades), agrupando por día.
 */
import { useMemo, useState } from "react"
import type React from "react"
import { Box, IconButton, Paper, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material"
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded"
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded"
import TodayRounded from "@mui/icons-material/TodayRounded"
import { useQuery } from "@tanstack/react-query"
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { es } from "date-fns/locale"
import { actividadService } from "../../../services/actividadService"
import { extractArray } from "@/hooks/useApiQuery"
import type { ActividadListResponse, TActividadPlanTrabajo } from "../../../types/actividades"
import { ActividadDetailModal } from "../ActividadDetailModal"
import { ActividadPill } from "./ActividadPill"
import { ESTADO_STYLES, dateKey, groupActividadesByDate } from "./calendar-utils"
import { MEDIDA_COLORS } from "../restyle/medida-theme"

type Vista = "mes" | "semana" | "dia"

interface ActividadesCalendarioProps {
  planTrabajoId: number
  legajoId?: number
  medidaId?: number
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

const MAX_VISIBLE_MONTH = 3

export const ActividadesCalendario: React.FC<ActividadesCalendarioProps> = ({ planTrabajoId, legajoId, medidaId }) => {
  const [vista, setVista] = useState<Vista>("mes")
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedActividad, setSelectedActividad] = useState<TActividadPlanTrabajo | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["actividades-calendario", planTrabajoId],
    queryFn: () => actividadService.list(planTrabajoId),
    enabled: !!planTrabajoId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  })

  const actividades = useMemo(
    () => extractArray(data as ActividadListResponse | TActividadPlanTrabajo[] | undefined),
    [data],
  )
  const byDate = useMemo(() => groupActividadesByDate(actividades), [actividades])

  const goToday = () => setCursor(new Date())
  const goPrev = () =>
    setCursor((prev) => (vista === "mes" ? addMonths(prev, -1) : vista === "semana" ? addWeeks(prev, -1) : addDays(prev, -1)))
  const goNext = () =>
    setCursor((prev) => (vista === "mes" ? addMonths(prev, 1) : vista === "semana" ? addWeeks(prev, 1) : addDays(prev, 1)))

  const openDay = (day: Date) => {
    setCursor(day)
    setVista("dia")
  }

  const rangeLabel = useMemo(() => {
    if (vista === "mes") {
      const label = format(cursor, "MMMM yyyy", { locale: es })
      return label.charAt(0).toUpperCase() + label.slice(1)
    }
    if (vista === "semana") {
      const start = startOfWeek(cursor, { weekStartsOn: 1 })
      const end = endOfWeek(cursor, { weekStartsOn: 1 })
      const sameMonth = isSameMonth(start, end)
      return sameMonth
        ? `${format(start, "d")} – ${format(end, "d 'de' MMMM yyyy", { locale: es })}`
        : `${format(start, "d MMM")} – ${format(end, "d MMM yyyy", { locale: es })}`
    }
    const label = format(cursor, "EEEE d 'de' MMMM yyyy", { locale: es })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }, [vista, cursor])

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: "12px", border: `1px solid ${MEDIDA_COLORS.border}`, overflow: "hidden" }}
    >
      {/* Header: navegación + selector de vista */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          p: "12px 16px",
          borderBottom: `1px solid ${MEDIDA_COLORS.border}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <IconButton size="small" onClick={goPrev} aria-label="Anterior">
            <ChevronLeftRounded fontSize="small" />
          </IconButton>
          <Tooltip title="Ir a hoy">
            <IconButton size="small" onClick={goToday} aria-label="Hoy">
              <TodayRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={goNext} aria-label="Siguiente">
            <ChevronRightRounded fontSize="small" />
          </IconButton>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", ml: 1 }}>{rangeLabel}</Typography>
        </Box>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={vista}
          onChange={(_, v) => v && setVista(v)}
          aria-label="Vista de calendario"
        >
          <ToggleButton value="mes" sx={{ textTransform: "none", px: 1.5 }}>
            Mes
          </ToggleButton>
          <ToggleButton value="semana" sx={{ textTransform: "none", px: 1.5 }}>
            Semana
          </ToggleButton>
          <ToggleButton value="dia" sx={{ textTransform: "none", px: 1.5 }}>
            Día
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Referencia: equipo (borde) y estado (punto) */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "14px", px: 2, py: "8px", bgcolor: "#f8fafc", borderBottom: `1px solid ${MEDIDA_COLORS.border}` }}>
        <LegendItem swatch={<Box sx={{ width: 3, height: 14, borderRadius: 1, bgcolor: "#1976d2" }} />} label="Equipo Técnico" />
        <LegendItem swatch={<Box sx={{ width: 3, height: 14, borderRadius: 1, bgcolor: "#7b1fa2" }} />} label="Equipo Legales" />
        {(["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "VENCIDA"] as const).map((estado) => (
          <LegendItem
            key={estado}
            swatch={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ESTADO_STYLES[estado].color }} />}
            label={ESTADO_STYLES[estado].label}
          />
        ))}
      </Box>

      {vista === "mes" && (
        <MonthGrid cursor={cursor} byDate={byDate} onDayClick={openDay} onActividadClick={setSelectedActividad} />
      )}
      {vista === "semana" && (
        <WeekGrid cursor={cursor} byDate={byDate} onDayClick={openDay} onActividadClick={setSelectedActividad} />
      )}
      {vista === "dia" && (
        <DayList cursor={cursor} byDate={byDate} onActividadClick={setSelectedActividad} />
      )}

      {!isLoading && actividades.length === 0 && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No hay actividades planificadas en este plan de trabajo.
          </Typography>
        </Box>
      )}

      {selectedActividad && (
        <ActividadDetailModal
          open={!!selectedActividad}
          onClose={() => setSelectedActividad(null)}
          actividad={selectedActividad}
          legajoId={legajoId}
          medidaId={medidaId}
          onUpdate={() => refetch()}
        />
      )}
    </Paper>
  )
}

function LegendItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {swatch}
      <Typography sx={{ fontSize: 11, color: "#64748b" }}>{label}</Typography>
    </Box>
  )
}

interface GridProps {
  cursor: Date
  byDate: Map<string, TActividadPlanTrabajo[]>
  onDayClick: (day: Date) => void
  onActividadClick: (a: TActividadPlanTrabajo) => void
}

function MonthGrid({ cursor, byDate, onDayClick, onActividadClick }: GridProps) {
  const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const today = new Date()

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "#f8fafc" }}>
        {WEEKDAY_LABELS.map((d) => (
          <Typography key={d} sx={{ fontSize: 10, fontWeight: 700, color: "#64748b", textAlign: "center", py: "6px" }}>
            {d}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {days.map((day) => {
          const key = dateKey(day)
          const items = byDate.get(key) || []
          const visible = items.slice(0, MAX_VISIBLE_MONTH)
          const overflow = items.length - visible.length
          const outOfMonth = !isSameMonth(day, cursor)
          const isToday = isSameDay(day, today)
          return (
            <Box
              key={key}
              onClick={() => onDayClick(day)}
              sx={{
                minHeight: 96,
                p: "6px",
                borderTop: `1px solid ${MEDIDA_COLORS.border}`,
                borderRight: `1px solid ${MEDIDA_COLORS.border}`,
                bgcolor: outOfMonth ? "#fafafa" : "#fff",
                cursor: "pointer",
                "&:hover": { bgcolor: outOfMonth ? "#f5f5f5" : "#f8fafc" },
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: isToday ? 800 : 500,
                  color: outOfMonth ? "#cbd5e1" : isToday ? "#1976d2" : "#334155",
                  mb: "4px",
                  ...(isToday && {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    bgcolor: "rgba(25,118,210,.12)",
                  }),
                }}
              >
                {format(day, "d")}
              </Typography>
              {visible.map((a) => (
                <ActividadPill key={a.id} actividad={a} onClick={() => onActividadClick(a)} dense />
              ))}
              {overflow > 0 && (
                <Typography
                  onClick={(e) => {
                    e.stopPropagation()
                    onDayClick(day)
                  }}
                  sx={{ fontSize: 10, fontWeight: 600, color: "#1976d2", cursor: "pointer", mt: "2px" }}
                >
                  +{overflow} más
                </Typography>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

function WeekGrid({ cursor, byDate, onDayClick, onActividadClick }: GridProps) {
  const weekStart = startOfWeek(cursor, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })
  const today = new Date()

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", minHeight: 320 }}>
      {days.map((day, i) => {
        const key = dateKey(day)
        const items = byDate.get(key) || []
        const isToday = isSameDay(day, today)
        return (
          <Box
            key={key}
            sx={{
              borderTop: `1px solid ${MEDIDA_COLORS.border}`,
              borderRight: i < 6 ? `1px solid ${MEDIDA_COLORS.border}` : "none",
              p: "8px",
              bgcolor: isToday ? "rgba(25,118,210,.04)" : "#fff",
            }}
          >
            <Box
              onClick={() => onDayClick(day)}
              sx={{ cursor: "pointer", mb: "6px", display: "flex", alignItems: "baseline", gap: "4px" }}
            >
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                {format(day, "EEE", { locale: es })}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? "#1976d2" : "#334155" }}>
                {format(day, "d")}
              </Typography>
            </Box>
            {items.length === 0 ? (
              <Typography sx={{ fontSize: 10, color: "#cbd5e1" }}>—</Typography>
            ) : (
              items.map((a) => <ActividadPill key={a.id} actividad={a} onClick={() => onActividadClick(a)} dense />)
            )}
          </Box>
        )
      })}
    </Box>
  )
}

function DayList({
  cursor,
  byDate,
  onActividadClick,
}: {
  cursor: Date
  byDate: Map<string, TActividadPlanTrabajo[]>
  onActividadClick: (a: TActividadPlanTrabajo) => void
}) {
  const items = byDate.get(dateKey(cursor)) || []

  if (items.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No hay actividades planificadas este día.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      {items.map((a) => (
        <ActividadPill key={a.id} actividad={a} onClick={() => onActividadClick(a)} dense={false} />
      ))}
    </Box>
  )
}
