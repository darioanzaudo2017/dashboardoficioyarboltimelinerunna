import React from 'react'
import { Box, Grid, TextField, InputAdornment, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import FolderIcon from '@mui/icons-material/Folder'
import type { GlobalActividadFilters } from '../../../services/globalActividadService'
import type { TTipoOficio } from '../../../../[id]/medida/[medidaId]/types/actividades'
import type { TableVariant } from '../../UnifiedActividadesTable'
import { ACTOR_OPTIONS, ORIGEN_OPTIONS } from '../constants'
import { handleKeyDown } from '../utils'

interface PrimaryFiltersRowProps {
  filters: GlobalActividadFilters
  onFilterChange: (key: keyof GlobalActividadFilters, value: any) => void
  canSeeAllActors: boolean
  variant: TableVariant
  showNnyaLegajoSection: boolean
  user: { id?: number } | null | undefined
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  advancedFilterCount: number
  localSearch: string
  setLocalSearch: (v: string) => void
  localNumeroLegajo: string
  setLocalNumeroLegajo: (v: string) => void
  tiposOficio: TTipoOficio[]
  isLoadingTiposOficio: boolean
  categoriasOficio: { id: number; nombre: string }[]
}

/**
 * Fila de filtros primarios (siempre visible).
 * Movida tal cual desde `AdvancedFiltersPanel.tsx` (líneas 242-482).
 */
export const PrimaryFiltersRow = ({
  filters,
  onFilterChange,
  canSeeAllActors,
  variant,
  showNnyaLegajoSection,
  user,
  expanded,
  setExpanded,
  advancedFilterCount,
  localSearch,
  setLocalSearch,
  localNumeroLegajo,
  setLocalNumeroLegajo,
  tiposOficio,
  isLoadingTiposOficio,
  categoriasOficio,
}: PrimaryFiltersRowProps) => (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Search */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar (descripción, tipo, NNyA, legajo, responsable)..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: localSearch && localSearch !== (filters.search || '') ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      ...
                    </Typography>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          {showNnyaLegajoSection && (
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="N° de legajo"
                placeholder="LEG-2026-..."
                value={localNumeroLegajo}
                onChange={(e) => setLocalNumeroLegajo(e.target.value)}
                onKeyDown={handleKeyDown}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FolderIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}

          {/* Quick Filter: Mis Actividades */}
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant={filters.responsable === user?.id ? 'contained' : 'outlined'}
              color="secondary"
              startIcon={<PersonIcon />}
              onClick={() => {
                if (filters.responsable === user?.id) {
                  onFilterChange('responsable', undefined)
                } else {
                  onFilterChange('responsable', user?.id)
                }
              }}
              sx={{
                height: 40,
                textTransform: 'none',
                fontWeight: filters.responsable === user?.id ? 700 : 400
              }}
            >
              Mis Actividades
            </Button>
          </Grid>

          <Grid item xs={12} sx={{ display: { xs: 'block', sm: 'none' } }}>
            <Button
              type="button"
              fullWidth
              variant={expanded ? 'contained' : 'outlined'}
              color={advancedFilterCount > 0 ? 'primary' : 'inherit'}
              startIcon={<FilterListIcon />}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls="activity-filters-panel"
              sx={{ height: 42, textTransform: 'none', fontWeight: 600 }}
            >
              {expanded ? 'Ocultar filtros' : 'Más filtros'}
              {advancedFilterCount > 0 && ` (${advancedFilterCount})`}
            </Button>
          </Grid>

          {/* Actor - only show if user can see all actors */}
          {canSeeAllActors && (
            <Grid item xs={12} sm={6} md={2} sx={{ display: { xs: expanded ? 'block' : 'none', sm: 'block' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Equipo</InputLabel>
                <Select
                  value={filters.actor || ''}
                  onChange={(e) => onFilterChange('actor', e.target.value)}
                  label="Equipo"
                >
                  {ACTOR_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Origen */}
          <Grid item xs={12} sm={6} md={2} sx={{ display: { xs: expanded ? 'block' : 'none', sm: 'block' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Origen</InputLabel>
              <Select
                value={filters.origen || ''}
                onChange={(e) => onFilterChange('origen', e.target.value)}
                label="Origen"
              >
                {ORIGEN_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {variant === 'global' && (
            <>
              <Grid item xs={12} sm={6} md={2} sx={{ display: { xs: expanded ? 'block' : 'none', sm: 'block' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría de oficio</InputLabel>
                  <Select
                    value={filters.categoria_oficio || ''}
                    onChange={(e) => {
                      const categoriaId = e.target.value ? Number(e.target.value) : undefined
                      onFilterChange('categoria_oficio', categoriaId)
                      const tipoSeleccionado = tiposOficio.find((tipo) => tipo.id === filters.tipo_oficio)
                      if (tipoSeleccionado?.categoria?.id !== categoriaId) {
                        onFilterChange('tipo_oficio', undefined)
                      }
                    }}
                    label="Categoría de oficio"
                    disabled={isLoadingTiposOficio}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {categoriasOficio.map((categoria) => (
                      <MenuItem key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2} sx={{ display: { xs: expanded ? 'block' : 'none', sm: 'block' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de oficio</InputLabel>
                  <Select
                    value={filters.tipo_oficio || ''}
                    onChange={(e) => onFilterChange('tipo_oficio', e.target.value ? Number(e.target.value) : undefined)}
                    label="Tipo de oficio"
                    disabled={isLoadingTiposOficio}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {tiposOficio
                      .filter((tipo) => !filters.categoria_oficio || tipo.categoria?.id === filters.categoria_oficio)
                      .map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2} sx={{ display: { xs: expanded ? 'block' : 'none', sm: 'block' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado del oficio</InputLabel>
                  <Select
                    value={filters.estado_oficio || ''}
                    onChange={(e) => onFilterChange('estado_oficio', e.target.value)}
                    label="Estado del oficio"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="PENDIENTE">Pendiente de respuesta</MenuItem>
                    <MenuItem value="CONTESTADO">Contestado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Ordering */}
          <Grid
            item
            xs={12}
            sm={6}
            md={canSeeAllActors ? 1.5 : 2.5}
            sx={{ display: { xs: expanded ? 'block' : 'none', sm: 'block' } }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={filters.ordering || '-fecha_creacion'}
                onChange={(e) => onFilterChange('ordering', e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="-fecha_creacion">Más recientes</MenuItem>
                <MenuItem value="fecha_creacion">Más antiguos</MenuItem>
                <MenuItem value="fecha_planificacion">Fecha planificada (asc)</MenuItem>
                <MenuItem value="-fecha_planificacion">Fecha planificada (desc)</MenuItem>
                <MenuItem value="dias_restantes">Plazo más urgente</MenuItem>
                <MenuItem value="-dias_restantes">Plazo más lejano</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Advanced Filters Toggle */}
          <Grid
            item
            xs={12}
            sm={6}
            md={canSeeAllActors ? 1.5 : 2.5}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <Button
              type="button"
              fullWidth
              variant={expanded ? 'contained' : 'outlined'}
              color={advancedFilterCount > 0 ? 'primary' : 'inherit'}
              startIcon={<FilterListIcon />}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setExpanded(!expanded)}
              sx={{ height: 40 }}
            >
              Filtros {advancedFilterCount > 0 && `(${advancedFilterCount})`}
            </Button>
          </Grid>
        </Grid>
)
