import { useState, useEffect } from 'react'
import type { GlobalActividadFilters } from '../../../services/globalActividadService'

/**
 * Estado local del panel de filtros: expansión + los cuatro inputs con debounce.
 *
 * Los hooks se declaran en el MISMO ORDEN que en el archivo original
 * (useState(expanded) -> 4 useState locales -> 5 useEffect), y los cinco arrays
 * de dependencias quedaron intactos.
 */
export const useFilterPanelState = (
  filters: GlobalActividadFilters,
  onFilterChange: (key: keyof GlobalActividadFilters, value: any) => void,
) => {
  const [expanded, setExpanded] = useState(false)

  // Debounced search state - local state for immediate UI feedback
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localNnyaNombre, setLocalNnyaNombre] = useState(filters.nnya_nombre || '')
  const [localNnyaDni, setLocalNnyaDni] = useState(filters.nnya_dni || '')
  const [localNumeroLegajo, setLocalNumeroLegajo] = useState(filters.numero_legajo || '')

  // Sync local state when filters are cleared externally
  useEffect(() => {
    setLocalSearch(filters.search || '')
    setLocalNnyaNombre(filters.nnya_nombre || '')
    setLocalNnyaDni(filters.nnya_dni || '')
    setLocalNumeroLegajo(filters.numero_legajo || '')
  }, [filters.search, filters.nnya_nombre, filters.nnya_dni, filters.numero_legajo])

  // Debounced search - 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        onFilterChange('search', localSearch || undefined)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch, filters.search, onFilterChange])

  // Debounced NNyA name search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localNnyaNombre !== (filters.nnya_nombre || '')) {
        onFilterChange('nnya_nombre', localNnyaNombre || undefined)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localNnyaNombre, filters.nnya_nombre, onFilterChange])

  // Debounced NNyA DNI search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localNnyaDni !== (filters.nnya_dni || '')) {
        onFilterChange('nnya_dni', localNnyaDni || undefined)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localNnyaDni, filters.nnya_dni, onFilterChange])

  // Debounced legajo number search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localNumeroLegajo !== (filters.numero_legajo || '')) {
        onFilterChange('numero_legajo', localNumeroLegajo || undefined)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localNumeroLegajo, filters.numero_legajo, onFilterChange])

  return {
    expanded, setExpanded,
    localSearch, setLocalSearch,
    localNnyaNombre, setLocalNnyaNombre,
    localNnyaDni, setLocalNnyaDni,
    localNumeroLegajo, setLocalNumeroLegajo,
  }
}
