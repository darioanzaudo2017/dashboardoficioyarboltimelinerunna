import type { GlobalActividadFilters } from '../../services/globalActividadService'
import type { TableVariant } from '../UnifiedActividadesTable'

export interface AdvancedFiltersPanelProps {
  filters: GlobalActividadFilters
  onFilterChange: (key: keyof GlobalActividadFilters, value: any) => void
  onClearFilters: () => void
  canSeeAllActors: boolean
  /** Variant determines which filter sections to show */
  variant?: TableVariant
}
