"use client"

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Autocomplete
} from "@mui/material"
import { useState, useEffect } from "react"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import type { CambioLugarResguardo, TLocalCentroVida } from "../../../../../types/seguimiento-dispositivo"
import { seguimientoDispositivoService } from "../../../../../api/seguimiento-dispositivo-api-service"
import { toast } from "react-toastify"
import { logger } from "@/utils/logger"
import { formatDate, formatDateTime } from "../utils"

// Cambio de Lugar de Resguardo Section (shared between MPE and MPJ)
export const CambioLugarResguardoSection = ({ medidaId, legajoId }: { medidaId: number; legajoId?: number }) => {
  const [cambios, setCambios] = useState<CambioLugarResguardo[]>([])
  const [locales, setLocales] = useState<TLocalCentroVida[]>([])
  const [lugarOrigen, setLugarOrigen] = useState<TLocalCentroVida | null>(null)
  const [lugarDestino, setLugarDestino] = useState<TLocalCentroVida | null>(null)
  const [fecha, setFecha] = useState("")
  const [motivo, setMotivo] = useState("")
  const [autorizadoPor, setAutorizadoPor] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingLocales, setLoadingLocales] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  // Fetch locations on mount
  useEffect(() => {
    fetchLocales()
  }, [])

  // Fetch existing cambios on mount
  useEffect(() => {
    fetchCambios()
  }, [medidaId, legajoId])

  const fetchLocales = async () => {
    setLoadingLocales(true)
    try {
      const data = await seguimientoDispositivoService.listLocalesCentroVida()
      setLocales(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.error('Error fetching locales:', error)
      setLocales([])
    } finally {
      setLoadingLocales(false)
    }
  }

  const fetchCambios = async () => {
    setLoading(true)
    try {
      const data = await seguimientoDispositivoService.listCambiosLugar(medidaId, legajoId)
      setCambios(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.error('Error fetching cambios de lugar:', error)
      setCambios([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!lugarOrigen || !lugarDestino || !fecha) {
      toast.error('Lugar origen, lugar destino y fecha son requeridos')
      return
    }

    if (lugarOrigen.id === lugarDestino.id) {
      toast.error('El lugar de origen y destino no pueden ser iguales')
      return
    }

    try {
      const savedCambio = await seguimientoDispositivoService.addCambioResguardo(medidaId, {
        lugar_origen: lugarOrigen.id,
        lugar_destino: lugarDestino.id,
        fecha_cambio: fecha,
        motivo: motivo || undefined,
        autorizado_por: autorizadoPor || undefined
      }, legajoId)

      // Reset form
      setLugarOrigen(null)
      setLugarDestino(null)
      setFecha('')
      setMotivo('')
      setAutorizadoPor('')

      // Add new cambio to local state
      setCambios(prev => [savedCambio, ...prev])
    } catch (error) {
      logger.error('Error saving cambio de lugar:', error)
    }
  }
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1976d2' }}>
        Cambio de Lugar de Resguardo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registre los cambios de ubicación del NNyA en diferentes dispositivos
      </Typography>

      {/* Form to add new cambio */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#fafafa' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
          Nuevo Cambio de Lugar
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={locales}
              getOptionLabel={(option) => option.nombre}
              value={lugarOrigen}
              onChange={(_, newValue) => setLugarOrigen(newValue)}
              loading={loadingLocales}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Lugar de Origen"
                  placeholder="Seleccione el lugar actual"
                  helperText="Seleccione el lugar donde se encuentra actualmente el NNyA"
                  error={!lugarOrigen}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.nombre}
                    </Typography>
                    {option.direccion && (
                      <Typography variant="caption" color="text.secondary">
                        {option.direccion}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={locales}
              getOptionLabel={(option) => option.nombre}
              value={lugarDestino}
              onChange={(_, newValue) => setLugarDestino(newValue)}
              loading={loadingLocales}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Lugar de Destino"
                  placeholder="Seleccione el nuevo lugar"
                  helperText="Seleccione el lugar al que se trasladará el NNyA"
                  error={
                    !lugarDestino ||
                    Boolean(lugarOrigen && lugarOrigen.id === lugarDestino.id)
                  }
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.nombre}
                    </Typography>
                    {option.direccion && (
                      <Typography variant="caption" color="text.secondary">
                        {option.direccion}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="date"
              label="Fecha del Cambio"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: today
              }}
              helperText="Fecha en que se realizó el cambio"
              error={!fecha}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Autorizado Por"
              value={autorizadoPor}
              onChange={(e) => setAutorizadoPor(e.target.value)}
              placeholder="Ej: Juez Dr. Juan Pérez"
              helperText="Persona que autorizó el cambio (opcional)"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo del Cambio"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describa el motivo del cambio de lugar..."
              helperText="Detalle las razones del cambio (opcional)"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={!lugarOrigen || !lugarDestino || !fecha || (lugarOrigen && lugarDestino && lugarOrigen.id === lugarDestino.id)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  fontWeight: 600
                }}
              >
                Registrar Cambio
              </Button>
              <Typography variant="caption" color="text.secondary">
                * Campos requeridos: Lugar origen, Lugar destino y Fecha
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* List of saved cambios */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Historial de Cambios
          </Typography>
          {cambios.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Total: {cambios.length} {cambios.length === 1 ? 'cambio' : 'cambios'}
            </Typography>
          )}
        </Box>

        {loading ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Cargando historial de cambios...
            </Typography>
          </Paper>
        ) : cambios.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
              No hay cambios de lugar registrados
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Los cambios aparecerán aquí una vez que registre el primero
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cambios.map((cambio, index) => (
              <Card
                key={cambio.id}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)'
                  },
                  borderLeft: index === 0 ? '4px solid #1976d2' : '4px solid #e0e0e0'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            bgcolor: index === 0 ? '#1976d2' : '#9e9e9e',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          {index === 0 ? 'MÁS RECIENTE' : `CAMBIO #${cambios.length - index}`}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={8}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Movimiento
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                        {cambio.lugar_origen_nombre || `Dispositivo ${cambio.lugar_origen}`}
                        {' → '}
                        {cambio.lugar_destino_nombre || `Dispositivo ${cambio.lugar_destino}`}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Fecha del Cambio
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {formatDate(cambio.fecha_cambio)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Registrado
                      </Typography>
                      <Typography variant="body2">
                        {cambio.fecha_registro ? formatDateTime(cambio.fecha_registro) : '-'}
                      </Typography>
                    </Grid>

                    {cambio.motivo && (
                      <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Motivo
                          </Typography>
                          <Typography variant="body2">
                            {cambio.motivo}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}

                    {cambio.autorizado_por && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Autorizado Por
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {cambio.autorizado_por}
                        </Typography>
                      </Grid>
                    )}

                    {cambio.adjunto_url && (
                      <Grid item xs={12}>
                        <Button
                          size="small"
                          startIcon={<AttachFileIcon />}
                          sx={{ textTransform: 'none' }}
                        >
                          Ver Adjunto
                        </Button>
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
