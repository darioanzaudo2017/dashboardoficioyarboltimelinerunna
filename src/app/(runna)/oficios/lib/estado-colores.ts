import { institutionalColors } from "@/theme/colors"

/**
 * Mismos colores que usa la tabla de actividades en toda la app
 * (`ESTADO_COLORS` en `legajo/actividades/components/UnifiedActividadesTable.tsx`)
 * — copiados acá (no exportados desde ese archivo) para que la barra de
 * avance de un oficio se lea igual que el resto del sistema.
 */
export const ESTADO_ACTIVIDAD_COLORS: Record<string, string> = {
  PENDIENTE: "#ff9800",
  EN_PROGRESO: "#2196f3",
  COMPLETADA: "#4caf50",
  REALIZADA: "#4caf50",
  PENDIENTE_VISADO_JZ: "#f57c00",
  PENDIENTE_VISADO: "#9c27b0",
  VISADO_CON_OBSERVACION: "#ff5722",
  VISADO_APROBADO: institutionalColors.azulMedio,
  CANCELADA: "#f44336",
  VENCIDA: "#9e9e9e",
}

export const colorEstadoActividad = (estado: string): string => ESTADO_ACTIVIDAD_COLORS[estado] ?? "#9e9e9e"
