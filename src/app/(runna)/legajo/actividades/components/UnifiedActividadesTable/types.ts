import type { TActividadPlanTrabajo } from "../../../[id]/medida/[medidaId]/types/actividades"

export type TableVariant = "legajo" | "medida" | "global"

// ============================================================================
// PROPS INTERFACE
// ============================================================================

export interface UnifiedActividadesTableProps {
  /** Table variant determines available features */
  variant: TableVariant

  // === Data Source Options (choose one) ===
  /** For 'legajo' variant: pre-loaded actividades from props */
  actividades?: TActividadPlanTrabajo[]
  /** For 'medida' variant: plan trabajo ID for API fetch */
  planTrabajoId?: number
  /** For 'medida' variant: medida data for modals */
  medidaData?: any
  /** For 'medida' variant: filter by etapa (MPJ phases) */
  filterEtapa?: "APERTURA" | "PROCESO" | "CESE"
  /** Actors to exclude from the table (e.g., ['EQUIPO_LEGAL'] for separate Kanban) */
  excludeActors?: string[]

  // === Callbacks ===
  /** Called when data should be refreshed */
  onRefresh?: () => void
  /** Called when actividades are updated (e.g., bulk assign). Returns the full updated list. */
  onActividadesUpdate?: (updatedActividades: TActividadPlanTrabajo[]) => void

  // === UI Customization ===
  /** Title for the section (default based on variant) */
  title?: string
  /** Whether to show the section wrapper (SectionCard for legajo, Paper for others) */
  showWrapper?: boolean
}
