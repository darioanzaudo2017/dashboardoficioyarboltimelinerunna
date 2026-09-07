"use client"

import {
    Box,
    Typography,
    Paper,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    TextField,
    Card,
    CardContent,
    Grid,
    Alert,
} from "@mui/material"
import { useState, useEffect } from "react"
import { seguimientoDispositivoService } from "../../../../../api/seguimiento-dispositivo-api-service"
import { toast } from "react-toastify"
import type { TipoSituacion, SituacionNNyA } from "../../../../../types/seguimiento-dispositivo"
import { formatDateLocaleAR, formatDateTimeLocaleAR } from "@/utils/dateUtils"
import { logger } from "@/utils/logger"

// Situación del NNyA en Residencia (MPE specific) - Moved outside parent component
export const SituacionResidenciaSection = ({ medidaId, legajoId }: { medidaId: number; legajoId?: number }) => {
    const [tipoSituacion, setTipoSituacion] = useState<TipoSituacion>('AUTORIZACION')
    const [fechaSituacion, setFechaSituacion] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [situaciones, setSituaciones] = useState<SituacionNNyA[]>([])
    const [loading, setLoading] = useState(false)
    const [loadError, setLoadError] = useState(false)
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        let cancelled = false

        const fetchSituaciones = async () => {
            setLoading(true)
            setLoadError(false)
            try {
                const data = await seguimientoDispositivoService.listSituaciones(medidaId, legajoId)
                if (!cancelled) setSituaciones(Array.isArray(data) ? data : [])
            } catch (error) {
                logger.error('Error fetching situaciones:', error)
                if (!cancelled) {
                    setSituaciones([])
                    setLoadError(true)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        void fetchSituaciones()
        return () => {
            cancelled = true
        }
    }, [medidaId, legajoId])

    const handleSaveSituacion = async () => {
        if (!fechaSituacion) {
            toast.error('La fecha es requerida')
            return
        }

        try {
            const savedSituacion = await seguimientoDispositivoService.addSituacionDispositivo(medidaId, {
                tipo_situacion: tipoSituacion,
                fecha: fechaSituacion,
                observaciones: observaciones || undefined
            }, legajoId)

            // Reset form
            setTipoSituacion('AUTORIZACION')
            setFechaSituacion('')
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
                Situación del NNyA en Residencia
            </Typography>

            {/* Form to add new situación */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Grid container spacing={2}>
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
                                <FormControlLabel value="AUTORIZACION" control={<Radio />} label="Autorización" />
                                <FormControlLabel value="PERMISO" control={<Radio />} label="Permiso" />
                                <FormControlLabel value="PERMISO_PROLONGADO" control={<Radio />} label="Permiso Prolongado" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            type="date"
                            label="Fecha"
                            value={fechaSituacion}
                            onChange={(e) => setFechaSituacion(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                                max: today // Prevent future dates
                            }}
                            helperText="La fecha no puede ser futura (requerido)"
                            error={!fechaSituacion}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Observaciones"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Detalles adicionales sobre la situación (opcional)"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveSituacion}
                            disabled={!fechaSituacion}
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
                ) : loadError ? (
                    <Alert severity="error">
                        No se pudo cargar el historial de situaciones de residencia.
                    </Alert>
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
                                                {formatDateLocaleAR(situacion.fecha)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                Fecha de Registro
                                            </Typography>
                                            <Typography variant="body2">
                                                {situacion.fecha_registro ? formatDateTimeLocaleAR(situacion.fecha_registro) : '-'}
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
