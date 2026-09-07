"use client"

import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    IconButton,
    Card,
    CardContent,
    Grid,
    Alert,
} from "@mui/material"
import { useState, useEffect } from "react"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import DeleteIcon from "@mui/icons-material/Delete"
import { seguimientoDispositivoService } from "../../../../../api/seguimiento-dispositivo-api-service"
import { toast } from "react-toastify"
import type { NotaSeguimiento } from "../../../../../types/seguimiento-dispositivo"
import { formatDateLocaleAR, formatDateTimeLocaleAR } from "@/utils/dateUtils"
import { logger } from "@/utils/logger"

// Notas de Seguimiento Section (shared between MPE and MPJ)
export const NotasSeguimientoSection = ({ medidaId, legajoId }: { medidaId: number; legajoId?: number }) => {
  const [notas, setNotas] = useState<NotaSeguimiento[]>([])
  const [titulo, setTitulo] = useState("")
  const [nota, setNota] = useState("")
  const [fecha, setFecha] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    let cancelled = false

    const fetchNotas = async () => {
      setLoading(true)
      setLoadError(false)
      try {
        const data = await seguimientoDispositivoService.listNotasSeguimiento(medidaId, legajoId)
        if (!cancelled) setNotas(Array.isArray(data) ? data : [])
      } catch (error) {
        logger.error('Error fetching notas de seguimiento:', error)
        if (!cancelled) {
          setNotas([])
          setLoadError(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchNotas()
    return () => {
      cancelled = true
    }
  }, [medidaId, legajoId])

  const handleSave = async () => {
    if (!titulo || !nota || !fecha) {
      toast.error('Título, nota y fecha son requeridos')
      return
    }

    try {
      const savedNota = await seguimientoDispositivoService.addNotaSeguimiento(medidaId, {
        titulo: titulo,
        nota: nota,
        fecha: fecha,
      }, legajoId)

      // Reset form
      setTitulo('')
      setNota('')
      setFecha('')

      // Add new nota to local state
      setNotas(prev => [savedNota, ...prev])
    } catch (error) {
      logger.error('Error saving nota de seguimiento:', error)
    }
  }

  const handleDelete = async (notaId: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta nota de seguimiento?')) {
      return
    }

    try {
      await seguimientoDispositivoService.deleteNotaSeguimiento(medidaId, notaId)
      toast.success('Nota eliminada exitosamente')

      // Remove from local state
      setNotas(prev => prev.filter(n => n.id !== notaId))
    } catch (error) {
      logger.error('Error deleting nota:', error)
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1976d2' }}>
        Notas de Seguimiento
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registre observaciones y seguimiento del NNyA en la residencia
      </Typography>

      {/* Form to add new nota */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#fafafa' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
          Nueva Nota de Seguimiento
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              label="Título de la Nota"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Visita de seguimiento mensual"
              helperText="Ingrese un título descriptivo para la nota"
              error={!titulo && titulo !== ""}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              type="date"
              label="Fecha de la Nota"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: today
              }}
              helperText="Fecha del seguimiento"
              error={!fecha}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Describa detalladamente las observaciones del seguimiento..."
              helperText="Describa las observaciones y detalles del seguimiento"
              error={!nota && nota !== ""}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={!titulo || !nota || !fecha}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  fontWeight: 600
                }}
              >
                Agregar Nota
              </Button>
              <Typography variant="caption" color="text.secondary">
                * Campos requeridos: Título, Nota y Fecha
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* List of saved notas */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Historial de Notas
          </Typography>
          {notas.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Total: {notas.length} {notas.length === 1 ? 'nota' : 'notas'}
            </Typography>
          )}
        </Box>

        {loading ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Cargando notas de seguimiento...
            </Typography>
          </Paper>
        ) : loadError ? (
          <Alert severity="error">
            No se pudo cargar el historial de notas de seguimiento.
          </Alert>
        ) : notas.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
              No hay notas de seguimiento registradas
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Las notas aparecerán aquí una vez que registre la primera
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notas.map((nota, index) => (
              <Card
                key={nota.id}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {index === 0 && (
                          <Box
                            sx={{
                              bgcolor: '#1976d2',
                              color: 'white',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            MÁS RECIENTE
                          </Box>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Fecha: {formatDateLocaleAR(nota.fecha)}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1976d2', fontSize: '1.1rem' }}>
                        {nota.titulo}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {nota.adjunto_url && (
                        <IconButton
                          component="a"
                          href={nota.adjunto_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir adjunto de ${nota.titulo}`}
                          size="small"
                          color="primary"
                          sx={{
                            bgcolor: 'rgba(25, 118, 210, 0.1)',
                            '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                          }}
                        >
                          <AttachFileIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(nota.id!)}
                        sx={{
                          bgcolor: 'rgba(244, 67, 54, 0.1)',
                          '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {nota.nota}
                    </Typography>
                  </Paper>

                  <Grid container spacing={2}>
                    {nota.autor_nombre && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Autor
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {nota.autor_nombre}
                        </Typography>
                      </Grid>
                    )}
                    {nota.fecha_registro && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Fecha de Registro
                        </Typography>
                        <Typography variant="body2">
                          {formatDateTimeLocaleAR(nota.fecha_registro)}
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
