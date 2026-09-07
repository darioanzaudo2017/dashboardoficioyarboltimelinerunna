import type { TableVariant } from "./types"

/** Flags de funcionalidad derivados de la variante de la tabla. */
export const buildFeatures = (variant: TableVariant) => ({
  // Selection & Bulk Actions - enabled for ALL variants
  showCheckbox: true,
  showBulkAssign: true,

  // Advanced Filters - enabled for ALL variants
  showAdvancedFilters: true,

  // Data columns - context-specific
  showNnyaLegajo: variant === "global",
  showFechaPlanificacion: true, // Show for all variants
  showZonas: variant === "global", // Show zonas column for global activities (PLTM Zonas Anidadas)

  // Acuse de Recibo - enabled for ALL variants
  showAcuseRecibo: true,
  showGoToLegajo: variant === "global",
  showRefreshButton: variant === "global" || variant === "medida",

  // Medida-specific features
  showEdit: variant === "medida",
  showCancel: variant === "medida",
  showIndividualAssign: variant === "medida",
  showAddActivity: variant === "medida",

  // Deprecated - replaced by showAdvancedFilters for all
  showQuickFilterChips: false,
  showEstadoChipFilters: false,

  // Statistics display
  showProgressBar: variant === "legajo",
  showStatCards: true,

  // Wrapper style
  useSectionCard: variant === "legajo",
})

export type ActividadFeatures = ReturnType<typeof buildFeatures>
