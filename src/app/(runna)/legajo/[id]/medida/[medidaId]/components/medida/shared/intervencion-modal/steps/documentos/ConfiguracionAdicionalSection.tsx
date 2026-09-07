import {
    Alert,
    Box,
    Card,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import type { RegistroIntervencion } from "../../types"

interface ConfiguracionAdicionalSectionProps {
    formData: RegistroIntervencion["formData"]
    updateField: RegistroIntervencion["updateField"]
    intervencion: RegistroIntervencion["intervencion"]
    canEdit: RegistroIntervencion["canEdit"]
    canAprobarOrRechazar: RegistroIntervencion["canAprobarOrRechazar"]
}

export function ConfiguracionAdicionalSection({
    formData,
    updateField,
    intervencion,
    canEdit,
    canAprobarOrRechazar,
}: ConfiguracionAdicionalSectionProps) {
    return (
        <>
            {/* Configuración Adicional Section */}
            <Card elevation={2} sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    2. Configuración Adicional
                </Typography>

                {/* Informes ampliatorios */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Informes ampliatorios
                    </Typography>
                    <FormControl component="fieldset">
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            ¿Se requieren informes ampliatorios?
                        </Typography>
                        <RadioGroup
                            row
                            value={formData.requiere_informes_ampliatorios ? "Si" : "No"}
                            onChange={(e) => updateField('requiere_informes_ampliatorios', e.target.value === "Si")}
                        >
                            <FormControlLabel value="Si" control={<Radio />} label="Sí" disabled={!canEdit} />
                            <FormControlLabel value="No" control={<Radio />} label="No" disabled={!canEdit} />
                        </RadioGroup>
                    </FormControl>
                </Box>

                {/* Estado actual y acciones */}
                {intervencion && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                Estado actual
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Chip
                                    label={intervencion.estado_display}
                                    color={
                                        intervencion.estado === 'APROBADO' ? 'success' :
                                            intervencion.estado === 'ENVIADO' ? 'info' :
                                                intervencion.estado === 'RECHAZADO' ? 'error' :
                                                    'default'
                                    }
                                    sx={{ fontWeight: 600 }}
                                />
                                {intervencion.fecha_envio && (
                                    <Typography variant="caption" color="text.secondary">
                                        Enviado: {new Date(intervencion.fecha_envio).toLocaleString('es-AR')}
                                    </Typography>
                                )}
                            </Box>

                            {intervencion.observaciones_jz && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                        Observaciones del Jefe Zonal:
                                    </Typography>
                                    <Typography variant="body2">
                                        {intervencion.observaciones_jz}
                                    </Typography>
                                </Alert>
                            )}

                            {/* Metadata */}
                            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Registrado por: {intervencion.registrado_por_detalle?.nombre_completo || intervencion.registrado_por_detalle?.username || 'N/A'}
                                </Typography>
                                {intervencion.aprobado_por_detalle && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Aprobado por: {intervencion.aprobado_por_detalle.nombre_completo || intervencion.aprobado_por_detalle.username || 'N/A'}
                                    </Typography>
                                )}
                                {intervencion.rechazado_por_detalle && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Rechazado por: {intervencion.rechazado_por_detalle.nombre_completo || intervencion.rechazado_por_detalle.username || 'N/A'}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </>
                )}

                {/* Message for technicians about approval */}
                {!canAprobarOrRechazar && canEdit && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, p: 1.5, backgroundColor: 'rgba(2, 136, 209, 0.04)', borderRadius: 1 }}>
                        <InfoIcon sx={{ fontSize: 18, color: 'info.main' }} />
                        <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 500 }}>
                            Esta intervención requiere aprobación del Jefe Zonal o Responsable de UDER.
                        </Typography>
                    </Box>
                )}
            </Card>
        </>
    )
}
