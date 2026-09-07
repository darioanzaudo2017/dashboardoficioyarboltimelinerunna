"use client"

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  FormControl,
  Card,
  CardContent,
  FormControlLabel,
  RadioGroup,
  Radio
} from "@mui/material"
import { useState, useEffect } from "react"
import type { TipoSituacion, SituacionNNyA } from "../../../../../types/seguimiento-dispositivo"
import { seguimientoDispositivoService } from "../../../../../api/seguimiento-dispositivo-api-service"
import { toast } from "react-toastify"
import { logger } from "@/utils/logger"
import { formatDate, formatDateTime } from "../utils"

// Situación del NNyA en Instituto (MPJ specific) - API v2.0
export const SituacionInstitutoSection = ({ medidaId, legajoId }: { medidaId: number; legajoId?: number }) => {
  const [tipoSituacion, setTipoSituacion] = useState<TipoSituacion>('AUTORIZACION')
  const [fecha, setFecha] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [situaciones, setSituaciones] = useState<SituacionNNyA[]>([])
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  // Fetch existing situaciones on mount
  useEffect(() => {
    fetchSituaciones()
  }, [medidaId, legajoId])

  const fetchSituaciones = async () => {
    setLoading(true)
    try {
      const data = await seguimientoDispositivoService.listSituaciones(medidaId, legajoId)
      // Ensure data is an array
      setSituaciones(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.error('Error fetching situaciones:', error)
      setSituaciones([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!fecha) {
      toast.error('La fecha es requerida')
      return
    }

    try {
      const savedSituacion = await seguimientoDispositivoService.addSituacionDispositivo(medidaId, {
        tipo_situacion: tipoSituacion,
        fecha: fecha,
        observaciones: observaciones || undefined
      }, legajoId)

      // Reset form
      setTipoSituacion('AUTORIZACION')
      setFecha('')
      setObservaciones('')

      // Add new situación to local state instead of refetching
      setSituaciones(prev => [savedSituacion, ...prev])
    } catch (error) {
      // Error handled by apiService
      logger.error('Error saving situación:', error)
    }
  }
  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
        Situación del NNyA en Instituto
      </Typography>

      {/* Form to add new situación */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Radio buttons for tipo_situacion */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Tipo de Situación *
              </Typography>
              <RadioGroup
                row
                value={tipoSituacion}
                onChange={(e) => setTipoSituacion(e.target.value as TipoSituacion)}
              >
                <FormControlLabel
                  value="AUTORIZACION"
                  control={<Radio />}
                  label="Autorización"
                />
                <FormControlLabel
                  value="PERMISO"
                  control={<Radio />}
                  label="Permiso"
                />
                <FormControlLabel
                  value="PERMISO_PROLONGADO"
                  control={<Radio />}
                  label="Permiso Prolongado"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Fecha field with validation */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="date"
              label="Fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: today // Prevent future dates
              }}
              helperText="La fecha no puede ser futura (requerido)"
              error={!fecha}
            />
          </Grid>

          {/* Observaciones */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles adicionales sobre la situación (opcional)"
            />
          </Grid>

          {/* Save button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!fecha}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Guardar Situación
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* List of saved situaciones */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Historial de Situaciones
        </Typography>
        {loading ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            Cargando situaciones...
          </Typography>
        ) : situaciones.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No hay situaciones registradas
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {situaciones.map((situacion) => (
              <Card key={situacion.id} elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Tipo
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {situacion.tipo_situacion_display}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Fecha
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatDate(situacion.fecha)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Fecha de Registro
                      </Typography>
                      <Typography variant="body2">
                        {situacion.fecha_registro ? formatDateTime(situacion.fecha_registro) : '-'}
                      </Typography>
                    </Grid>
                    {situacion.observaciones && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Observaciones
                        </Typography>
                        <Typography variant="body2">
                          {situacion.observaciones}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
