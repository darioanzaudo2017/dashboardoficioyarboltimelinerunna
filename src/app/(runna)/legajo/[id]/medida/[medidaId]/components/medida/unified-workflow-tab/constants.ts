import type { WorkflowPhase } from "../../../types/workflow"

/**
 * Etiquetas visibles de cada fase del workflow.
 *
 * En el archivo original este objeto estaba escrito CUATRO veces inline, con
 * las mismas claves y los mismos valores (sólo cambiaba el estilo de comillas).
 * Se extrae una vez para no repetirlo en los módulos nuevos.
 */
export const ETAPA_LABELS: Record<WorkflowPhase, string> = {
  apertura: "Apertura",
  innovacion: "Innovación",
  prorroga: "Prórroga",
  cese: "Cese",
}
