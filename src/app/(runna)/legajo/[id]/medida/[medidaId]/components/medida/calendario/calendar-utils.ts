// Utilidades compartidas por el calendario de actividades (mes/semana/día).
// Reusa los mismos colores de estado/actor que ya se usan en el resto de la
// medida (kanban de legalidad, estadísticas de plan de trabajo, detalle de
// actividad) para no inventar una paleta nueva.

import { parseISO, format, isValid } from "date-fns"
import type { TActividadPlanTrabajo } from "../../../types/actividades"

export interface EstadoStyle {
  label: string
  color: string
  bg: string
}

/** Mismos colores que ActividadesStatisticsPanel / ActividadDetailModal para pendiente/en progreso/completada/vencida. */
export const ESTADO_STYLES: Record<string, EstadoStyle> = {
  PENDIENTE: { label: "Pendiente", color: "#ff9800", bg: "rgba(255, 152, 0, 0.12)" },
  EN_PROGRESO: { label: "En Progreso", color: "#2196f3", bg: "rgba(33, 150, 243, 0.12)" },
  COMPLETADA: { label: "Completada", color: "#4caf50", bg: "rgba(76, 175, 80, 0.12)" },
  VENCIDA: { label: "Vencida", color: "#f44336", bg: "rgba(244, 67, 54, 0.12)" },
  CANCELADA: { label: "Cancelada", color: "#757575", bg: "rgba(117, 117, 117, 0.12)" },
  PENDIENTE_VISADO_JZ: { label: "Pend. Visado JZ", color: "#ff9800", bg: "rgba(255, 152, 0, 0.12)" },
  PENDIENTE_VISADO: { label: "Pend. Visado Legal", color: "#9c27b0", bg: "rgba(156, 39, 176, 0.12)" },
  VISADO_CON_OBSERVACION: { label: "Visado c/Observación", color: "#ff9800", bg: "rgba(255, 152, 0, 0.12)" },
  VISADO_APROBADO: { label: "Visado Aprobado", color: "#4caf50", bg: "rgba(76, 175, 80, 0.12)" },
}

const DEFAULT_ESTADO_STYLE: EstadoStyle = { label: "—", color: "#757575", bg: "rgba(117, 117, 117, 0.12)" }

/** Estado a mostrar: si venció y sigue activa, prioriza "Vencida" aunque el backend no haya cambiado el estado formal. */
export function getEstadoStyle(actividad: TActividadPlanTrabajo): EstadoStyle {
  if (actividad.esta_vencida && !["COMPLETADA", "CANCELADA", "VISADO_APROBADO"].includes(actividad.estado)) {
    return ESTADO_STYLES.VENCIDA
  }
  return ESTADO_STYLES[actividad.estado] || DEFAULT_ESTADO_STYLE
}

/** Clave estable yyyy-MM-dd (calendario local, sin hora) para agrupar por día de vencimiento. */
export function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/** Parsea fecha_planificacion de forma segura; null si falta o es inválida. */
export function parseFechaPlanificacion(actividad: TActividadPlanTrabajo): Date | null {
  if (!actividad.fecha_planificacion) return null
  const parsed = parseISO(actividad.fecha_planificacion)
  return isValid(parsed) ? parsed : null
}

/** Agrupa actividades por día (fecha_planificacion), ordenadas por hora dentro de cada día. */
export function groupActividadesByDate(
  actividades: TActividadPlanTrabajo[]
): Map<string, TActividadPlanTrabajo[]> {
  const map = new Map<string, TActividadPlanTrabajo[]>()
  for (const actividad of actividades) {
    const fecha = parseFechaPlanificacion(actividad)
    if (!fecha) continue
    const key = dateKey(fecha)
    const bucket = map.get(key)
    if (bucket) bucket.push(actividad)
    else map.set(key, [actividad])
  }
  for (const bucket of map.values()) {
    bucket.sort((a, b) => (a.fecha_planificacion || "").localeCompare(b.fecha_planificacion || ""))
  }
  return map
}

/** Etiqueta corta para una actividad: subtipo > tipo > descripción > fallback. */
export function actividadLabel(actividad: TActividadPlanTrabajo): string {
  return (
    actividad.subtipo_actividad_info?.nombre ||
    actividad.tipo_actividad_info?.nombre ||
    actividad.descripcion ||
    `Actividad #${actividad.id}`
  )
}
