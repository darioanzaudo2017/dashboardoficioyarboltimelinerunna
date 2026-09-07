import { Box, Typography, Chip } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import type { GlobalActividadFilters } from '../../../services/globalActividadService'
import { ESTADO_OPTIONS } from '../constants'

interface EstadoChipsProps {
  expanded: boolean
  selectedEstados: string[]
  handleEstadoToggle: (estadoValue: string) => void
  onFilterChange: (key: keyof GlobalActividadFilters, value: any) => void
}

/**
 * Chips multi-select de estado.
 * Movidos tal cual desde `AdvancedFiltersPanel.tsx` (líneas 485-519).
 */
export const EstadoChips = ({
  expanded,
  selectedEstados,
  handleEstadoToggle,
  onFilterChange,
}: EstadoChipsProps) => (
        <Box sx={{ mb: 2, display: { xs: expanded ? 'block' : 'none', sm: 'block' } }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Filtrar por estado (clic para activar/desactivar):
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {ESTADO_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                size="small"
                onClick={() => handleEstadoToggle(opt.value)}
                variant={selectedEstados.includes(opt.value) ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: selectedEstados.includes(opt.value) ? opt.color : 'transparent',
                  color: selectedEstados.includes(opt.value) ? 'white' : 'text.primary',
                  borderColor: opt.color,
                  '&:hover': {
                    backgroundColor: selectedEstados.includes(opt.value)
                      ? opt.color
                      : `${opt.color}20`,
                  },
                }}
              />
            ))}
            {selectedEstados.length > 0 && (
              <Chip
                label="Limpiar estados"
                size="small"
                variant="outlined"
                onDelete={() => onFilterChange('estado', '')}
                deleteIcon={<ClearIcon />}
              />
            )}
          </Box>
        </Box>
)
