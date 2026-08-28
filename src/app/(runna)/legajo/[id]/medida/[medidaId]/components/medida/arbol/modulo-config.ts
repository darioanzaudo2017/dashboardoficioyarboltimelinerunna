import type React from "react"

/**
 * Los "grandes módulos" de la medida, usados como etiqueta sobre cada
 * registro de la línea de tiempo (en vez de secciones separadas de página,
 * para no romper el orden cronológico real entre módulos).
 */
export type ModuloArbol =
  | "REGISTRO_MEDIDA"
  | "PROCESO_MEDIDA"
  | "PLAN_TRABAJO"
  | "CONTROL_LEGALIDAD"
  | "INFORMES_MENSUALES"
  | "SEGUIMIENTO"
  | "OFICIOS"
  | "MANUAL"

export interface ModuloConfigEntry {
  label: string
  color: string
  backgroundColor: string
}

export const MODULO_CONFIG: Record<ModuloArbol, ModuloConfigEntry> = {
  REGISTRO_MEDIDA: { label: "Registro de la Medida", color: "#424242", backgroundColor: "#EEEEEE" },
  PROCESO_MEDIDA: { label: "Proceso de la Medida", color: "#7B1FA2", backgroundColor: "#F3E5F5" },
  PLAN_TRABAJO: { label: "Plan de Trabajo", color: "#1976D2", backgroundColor: "#E3F2FD" },
  CONTROL_LEGALIDAD: { label: "Control de Legalidad", color: "#6A1B9A", backgroundColor: "#F3E5F5" },
  INFORMES_MENSUALES: { label: "Informes Mensuales", color: "#F57C00", backgroundColor: "#FFF3E0" },
  SEGUIMIENTO: { label: "Seguimiento", color: "#0097A7", backgroundColor: "#E0F7FA" },
  OFICIOS: { label: "Oficios", color: "#5D4037", backgroundColor: "#EFEBE9" },
  MANUAL: { label: "Manual", color: "#616161", backgroundColor: "#F5F5F5" },
}

/** Un nodo de la línea de tiempo única del árbol de la medida. */
export interface ItemLineaTiempo {
  id: string
  fecha: string
  modulo: ModuloArbol
  /** Etapa (Apertura/Innovación/Prórroga/Cese) cuando el registro pertenece a una. */
  etapaLabel?: string
  render: () => React.ReactNode
}
