import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import type { ActividadFeatures } from "../features"
import type { TableVariant } from "../types"

/** Datos y handlers que comparten la tabla, sus filas y las tarjetas mobile. */
export interface ActividadesRenderProps {
  paginatedActividades: TActividadPlanTrabajo[]
  features: ActividadFeatures
  selectedIds: Set<number>
  hasActiveFilters: boolean
  isActivityRead: (actividad: TActividadPlanTrabajo) => boolean
  shouldHighlightForRole: (actividad: TActividadPlanTrabajo) => boolean
  handleClearFilters: () => void
  handleRowClick: (actividad: TActividadPlanTrabajo) => void
  handleSelectOne: (id: number) => void
  handleRequestAcuse: (actividad: TActividadPlanTrabajo) => void
  handleGoToLegajo: (actividad: TActividadPlanTrabajo) => void
}

/** Handlers y contexto que sólo necesita la fila de la tabla de escritorio. */
export interface ActividadRowExtraProps {
  legajosLabelMap: Record<number, string>
  hasMultipleLegajos: boolean
  handleViewDetail: (actividad: TActividadPlanTrabajo) => void
  handleEdit: (actividad: TActividadPlanTrabajo) => void
  handleCancel: (actividad: TActividadPlanTrabajo) => void
  handleAssign: (actividad: TActividadPlanTrabajo) => void
}

export interface ActividadesTableProps extends ActividadesRenderProps, ActividadRowExtraProps {
  variant: TableVariant
  isAllSelected: boolean
  isIndeterminate: boolean
  handleSelectAll: () => void
}
