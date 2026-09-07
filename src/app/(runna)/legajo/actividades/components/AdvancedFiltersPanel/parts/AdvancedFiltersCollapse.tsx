import { Box, Grid, TextField, Typography, Button, FormControl, InputLabel, Select, MenuItem, Collapse, Paper, Divider, Autocomplete, InputAdornment, FormControlLabel, Checkbox } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ClearIcon from '@mui/icons-material/Clear'
import FilterListIcon from '@mui/icons-material/FilterList'
import PersonIcon from '@mui/icons-material/Person'
import FolderIcon from '@mui/icons-material/Folder'
import ChildCareIcon from '@mui/icons-material/ChildCare'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CategoryIcon from '@mui/icons-material/Category'
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread'
import type { GlobalActividadFilters } from '../../../services/globalActividadService'
import type { TTipoActividad } from '../../../../[id]/medida/[medidaId]/types/actividades'
import type { Usuario, Zona } from '@/app/(runna)/legajo-mesa/types/asignacion-types'
import { TIPO_MEDIDA_OPTIONS } from '../constants'
import { getUserDisplayName, handleKeyDown } from '../utils'

interface AdvancedFiltersCollapseProps {
  expanded: boolean
  showNnyaLegajoSection: boolean
  filters: GlobalActividadFilters
  onFilterChange: (key: keyof GlobalActividadFilters, value: any) => void
  onClearFilters: () => void
  localNnyaNombre: string
  setLocalNnyaNombre: (v: string) => void
  localNnyaDni: string
  setLocalNnyaDni: (v: string) => void
  localNumeroLegajo: string
  setLocalNumeroLegajo: (v: string) => void
  usuarios: Usuario[]
  isLoadingUsuarios: boolean
  tiposActividad: TTipoActividad[]
  isLoadingTipos: boolean
  zonas: Zona[]
  isLoadingZonas: boolean
}

/**
 * Panel colapsable de filtros avanzados (NNyA/Legajo, Responsable, Fechas y
 * Filtros adicionales). Movido tal cual desde `AdvancedFiltersPanel.tsx`
 * (líneas 522-856).
 */
export const AdvancedFiltersCollapse = ({
  expanded,
  showNnyaLegajoSection,
  filters,
  onFilterChange,
  onClearFilters,
  localNnyaNombre,
  setLocalNnyaNombre,
  localNnyaDni,
  setLocalNnyaDni,
  localNumeroLegajo,
  setLocalNumeroLegajo,
  usuarios,
  isLoadingUsuarios,
  tiposActividad,
  isLoadingTipos,
  zonas,
  isLoadingZonas,
}: AdvancedFiltersCollapseProps) => (
        <Collapse in={expanded} id="activity-filters-panel">
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2}>
              {/* Section: NNyA & Legajo - Only for global variant */}
              {showNnyaLegajoSection && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ChildCareIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" color="primary">
                        NNyA y Legajo
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre NNyA"
                      placeholder="Buscar por nombre/apellido..."
                      value={localNnyaNombre}
                      onChange={(e) => setLocalNnyaNombre(e.target.value)}
                      onKeyDown={handleKeyDown}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="DNI NNyA"
                      placeholder="Buscar por DNI..."
                      value={localNnyaDni}
                      onChange={(e) => setLocalNnyaDni(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Número de Legajo"
                      placeholder="Ej: LEG-2024-001"
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
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo de Medida</InputLabel>
                      <Select
                        value={filters.tipo_medida || ''}
                        onChange={(e) => onFilterChange('tipo_medida', e.target.value)}
                        label="Tipo de Medida"
                      >
                        {TIPO_MEDIDA_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                </>
              )}

              {/* Section: Responsable & Activity Type */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CategoryIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Responsable y Tipo de Actividad
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={usuarios}
                  getOptionLabel={(option) => getUserDisplayName(option)}
                  value={usuarios.find((u) => u.id === filters.responsable) || null}
                  onChange={(_, newValue) => onFilterChange('responsable', newValue?.id || undefined)}
                  loading={isLoadingUsuarios}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Responsable (principal o secundario)"
                      placeholder="Buscar usuario..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={tiposActividad}
                  getOptionLabel={(option) => option.nombre}
                  value={tiposActividad.find((t) => t.id === filters.tipo_actividad) || null}
                  onChange={(_, newValue) => onFilterChange('tipo_actividad', newValue?.id || undefined)}
                  loading={isLoadingTipos}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Tipo de Actividad"
                      placeholder="Buscar tipo..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={zonas}
                  getOptionLabel={(option) => option.nombre}
                  value={zonas.find((z) => z.id === filters.zona) || null}
                  onChange={(_, newValue) => onFilterChange('zona', newValue?.id || undefined)}
                  loading={isLoadingZonas}
                  renderInput={(params) => (
                    <TextField {...params} size="small" label="Zona" placeholder="Buscar zona..." />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {/* Section: Date Ranges */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarMonthIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Rangos de Fecha
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha planificada desde"
                  value={filters.fecha_desde ? new Date(filters.fecha_desde) : null}
                  onChange={(date) =>
                    onFilterChange('fecha_desde', date ? date.toISOString().split('T')[0] : undefined)
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha planificada hasta"
                  value={filters.fecha_hasta ? new Date(filters.fecha_hasta) : null}
                  onChange={(date) =>
                    onFilterChange('fecha_hasta', date ? date.toISOString().split('T')[0] : undefined)
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha creación desde"
                  value={filters.fecha_creacion_desde ? new Date(filters.fecha_creacion_desde) : null}
                  onChange={(date) =>
                    onFilterChange(
                      'fecha_creacion_desde',
                      date ? date.toISOString().split('T')[0] : undefined
                    )
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha creación hasta"
                  value={filters.fecha_creacion_hasta ? new Date(filters.fecha_creacion_hasta) : null}
                  onChange={(date) =>
                    onFilterChange(
                      'fecha_creacion_hasta',
                      date ? date.toISOString().split('T')[0] : undefined
                    )
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {/* Section: Additional Filters */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FilterListIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Filtros Adicionales
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Días restantes máximo"
                  type="number"
                  placeholder="Ej: 7"
                  value={filters.dias_restantes_max || ''}
                  onChange={(e) => onFilterChange('dias_restantes_max', e.target.value)}
                  onKeyDown={handleKeyDown}
                  helperText="Mostrar actividades con plazo <= días"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={9}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pt: 1 }}>
                  {/* Solo sin leer checkbox */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.sin_leer === true}
                        onChange={(e) =>
                          onFilterChange('sin_leer', e.target.checked ? true : undefined)
                        }
                        color="info"
                        icon={<MarkEmailUnreadIcon fontSize="small" />}
                        checkedIcon={<MarkEmailUnreadIcon fontSize="small" />}
                      />
                    }
                    label={
                      <Typography variant="body2" color="info.main" sx={{ fontWeight: 500 }}>
                        Solo sin leer
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.vencida === true || filters.vencida === 'true'}
                        onChange={(e) =>
                          onFilterChange('vencida', e.target.checked ? true : undefined)
                        }
                        color="error"
                      />
                    }
                    label={
                      <Typography variant="body2" color="error.main">
                        Solo vencidas
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          filters.pendiente_visado === true || filters.pendiente_visado === 'true'
                        }
                        onChange={(e) =>
                          onFilterChange('pendiente_visado', e.target.checked ? true : undefined)
                        }
                        color="secondary"
                      />
                    }
                    label={
                      <Typography variant="body2" color="secondary.main">
                        Pendientes de visado
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.es_borrador === true}
                        onChange={(e) =>
                          onFilterChange('es_borrador', e.target.checked ? true : undefined)
                        }
                        color="warning"
                      />
                    }
                    label={
                      <Typography variant="body2" color="warning.main">
                        Solo borradores
                      </Typography>
                    }
                  />
                </Box>
              </Grid>

              {/* Clear All Filters Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    color="inherit"
                    startIcon={<ClearIcon />}
                    onClick={onClearFilters}
                    size="small"
                  >
                    Limpiar todos los filtros
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
)
