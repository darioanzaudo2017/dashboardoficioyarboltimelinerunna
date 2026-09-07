"use client"

import React from 'react'
import { Box } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es } from 'date-fns/locale'
import { useUser } from '@/utils/auth/userZustand'
import type { AdvancedFiltersPanelProps } from './types'
import { countAdvancedFilters } from './utils'
import { useFilterPanelState } from './hooks/useFilterPanelState'
import { useFilterCatalogs } from './hooks/useFilterCatalogs'
import { PrimaryFiltersRow } from './parts/PrimaryFiltersRow'
import { EstadoChips } from './parts/EstadoChips'
import { AdvancedFiltersCollapse } from './parts/AdvancedFiltersCollapse'

export const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  canSeeAllActors,
  variant = 'global',
}) => {
  const { user } = useUser()
  // Determine which sections to show based on variant
  // Only show NNyA & Legajo section for global view since legajo/medida already have this context
  const showNnyaLegajoSection = variant === 'global'

  const {
    expanded, setExpanded,
    localSearch, setLocalSearch,
    localNnyaNombre, setLocalNnyaNombre,
    localNnyaDni, setLocalNnyaDni,
    localNumeroLegajo, setLocalNumeroLegajo,
  } = useFilterPanelState(filters, onFilterChange)

  const {
    usuarios, isLoadingUsuarios,
    tiposActividad, isLoadingTipos,
    zonas, isLoadingZonas,
    tiposOficio, isLoadingTiposOficio,
    categoriasOficio,
  } = useFilterCatalogs()

  // Parse estado values from comma-separated string
  const selectedEstados = filters.estado ? filters.estado.split(',').filter(Boolean) : []

  // Handle estado toggle
  const handleEstadoToggle = (estadoValue: string) => {
    const currentEstados = new Set(selectedEstados)
    if (currentEstados.has(estadoValue)) {
      currentEstados.delete(estadoValue)
    } else {
      currentEstados.add(estadoValue)
    }
    onFilterChange('estado', Array.from(currentEstados).join(','))
  }

  const advancedFilterCount = countAdvancedFilters(filters)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mb: 3 }}>
        {/* Primary Filters - Always Visible */}
        <PrimaryFiltersRow
          filters={filters}
          onFilterChange={onFilterChange}
          canSeeAllActors={canSeeAllActors}
          variant={variant}
          showNnyaLegajoSection={showNnyaLegajoSection}
          user={user}
          expanded={expanded}
          setExpanded={setExpanded}
          advancedFilterCount={advancedFilterCount}
          localSearch={localSearch}
          setLocalSearch={setLocalSearch}
          localNumeroLegajo={localNumeroLegajo}
          setLocalNumeroLegajo={setLocalNumeroLegajo}
          tiposOficio={tiposOficio}
          isLoadingTiposOficio={isLoadingTiposOficio}
          categoriasOficio={categoriasOficio}
        />

        {/* Estado Multi-Select Chips */}
        <EstadoChips
          expanded={expanded}
          selectedEstados={selectedEstados}
          handleEstadoToggle={handleEstadoToggle}
          onFilterChange={onFilterChange}
        />

        {/* Advanced Filters Panel */}
        <AdvancedFiltersCollapse
          expanded={expanded}
          showNnyaLegajoSection={showNnyaLegajoSection}
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          localNnyaNombre={localNnyaNombre}
          setLocalNnyaNombre={setLocalNnyaNombre}
          localNnyaDni={localNnyaDni}
          setLocalNnyaDni={setLocalNnyaDni}
          localNumeroLegajo={localNumeroLegajo}
          setLocalNumeroLegajo={setLocalNumeroLegajo}
          usuarios={usuarios}
          isLoadingUsuarios={isLoadingUsuarios}
          tiposActividad={tiposActividad}
          isLoadingTipos={isLoadingTipos}
          zonas={zonas}
          isLoadingZonas={isLoadingZonas}
        />
      </Box>
    </LocalizationProvider>
  )
}

export default AdvancedFiltersPanel
