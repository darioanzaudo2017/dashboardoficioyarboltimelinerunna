import { institutionalColors } from "@/theme/colors"

// Estado color configuration
export const ESTADO_COLORS: Record<string, { backgroundColor: string; color: string; bgLight: string; label: string }> = {
  PENDIENTE: { backgroundColor: "#ff9800", color: "white", bgLight: "rgba(255, 152, 0, 0.1)", label: "Pendiente" },
  EN_PROGRESO: { backgroundColor: "#2196f3", color: "white", bgLight: "rgba(33, 150, 243, 0.1)", label: "En Progreso" },
  COMPLETADA: { backgroundColor: "#4caf50", color: "white", bgLight: "rgba(76, 175, 80, 0.1)", label: "Completada" },
  REALIZADA: { backgroundColor: "#4caf50", color: "white", bgLight: "rgba(76, 175, 80, 0.1)", label: "Realizada" },
  PENDIENTE_VISADO_JZ: { backgroundColor: "#f57c00", color: "white", bgLight: "rgba(245, 124, 0, 0.1)", label: "Pend. Visado JZ" },
  PENDIENTE_VISADO: { backgroundColor: "#9c27b0", color: "white", bgLight: "rgba(156, 39, 176, 0.1)", label: "Pend. Visado" },
  VISADO_CON_OBSERVACION: { backgroundColor: "#ff5722", color: "white", bgLight: "rgba(255, 87, 34, 0.1)", label: "Visado c/Obs" },
  VISADO_APROBADO: { backgroundColor: institutionalColors.azulMedio, color: "white", bgLight: "rgba(39, 131, 208, 0.1)", label: "Visado Aprobado" },
  CANCELADA: { backgroundColor: "#f44336", color: "white", bgLight: "rgba(244, 67, 54, 0.1)", label: "Cancelada" },
  VENCIDA: { backgroundColor: "#9e9e9e", color: "white", bgLight: "rgba(158, 158, 158, 0.1)", label: "Vencida" },
}


export const getEstadoColor = (estado: string) => {
  return ESTADO_COLORS[estado] || { backgroundColor: "#9e9e9e", color: "white", bgLight: "rgba(158, 158, 158, 0.1)", label: estado }
}
