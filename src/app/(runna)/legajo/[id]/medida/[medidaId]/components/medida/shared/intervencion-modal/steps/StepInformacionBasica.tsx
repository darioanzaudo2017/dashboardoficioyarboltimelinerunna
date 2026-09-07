import {
    Alert,
    Box,
    Card,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material"
import BusinessIcon from "@mui/icons-material/Business"
import { PersonalInfoCard } from "../../personal-info-card"
import type { IntervencionModalProps, RegistroIntervencion } from "../types"

interface StepInformacionBasicaProps {
    error: RegistroIntervencion["error"]
    clearErrors: RegistroIntervencion["clearErrors"]
    formData: RegistroIntervencion["formData"]
    updateField: RegistroIntervencion["updateField"]
    intervencion: RegistroIntervencion["intervencion"]
    validationErrors: RegistroIntervencion["validationErrors"]
    canEdit: RegistroIntervencion["canEdit"]
    hasLegajoData: boolean
    legajoData: IntervencionModalProps["legajoData"]
    workflowPhase: IntervencionModalProps["workflowPhase"]
}

export function StepInformacionBasica({
    error,
    clearErrors,
    formData,
    updateField,
    intervencion,
    validationErrors,
    canEdit,
    hasLegajoData,
    legajoData,
    workflowPhase,
}: StepInformacionBasicaProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Error Alert */}
            {error && (
                <Alert severity="error" onClose={clearErrors}>
                    {error}
                </Alert>
            )}

            {/* Warning: Legajo data not available yet */}
            {!hasLegajoData && !intervencion && (
                <Alert severity="info">
                    <Typography variant="body2">
                        Los datos del legajo se están cargando... Si no aparecen, por favor cierre y vuelva a abrir el formulario.
                    </Typography>
                </Alert>
            )}

            {/* Personal Info Card - REFACTORED with atomic component */}
            <PersonalInfoCard
                data={{
                    codigo: intervencion?.codigo_intervencion,
                    fecha: formData.fecha_intervencion,
                    legajoNumero: legajoData?.numero || intervencion?.legajo_numero,
                    personaNombre: legajoData?.persona_nombre || intervencion?.persona_nombre,
                    personaApellido: legajoData?.persona_apellido || intervencion?.persona_apellido,
                    zonaNombre: legajoData?.zona_nombre || intervencion?.zona_nombre,
                }}
                readOnly={!canEdit}
                showCodigo={true}
                showFecha={true}
                onFechaChange={(fecha) => updateField('fecha_intervencion', fecha)}
                fechaRequired={true}
                fechaError={validationErrors.fecha_intervencion}
            />

            {/* Tipo de Cese Section - Only for CESE workflow phase */}
            {workflowPhase === 'cese' && (
                <Card elevation={2} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BusinessIcon sx={{ color: 'error.main', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Tipo de Cese
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo de cese</InputLabel>
                            <Select
                                value={formData.tipo_cese || ''}
                                onChange={(e) => {
                                    const newValue = e.target.value || null
                                    updateField('tipo_cese', newValue)
                                    // Clear subtipo when tipo changes
                                    updateField('subtipo_cese', null)
                                }}
                                label="Tipo de cese"
                                disabled={!canEdit}
                            >
                                <MenuItem value="">Sin especificar</MenuItem>
                                <MenuItem value="RESTITUCION_DERECHOS">Restitución de los derechos</MenuItem>
                                <MenuItem value="ADOPCION">Adopción</MenuItem>
                                <MenuItem value="OTRA_MEDIDA">Cese de la medida porque corresponde otro tipo de medida</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Subtipo de cese</InputLabel>
                            <Select
                                value={formData.subtipo_cese || ''}
                                onChange={(e) => updateField('subtipo_cese', e.target.value || null)}
                                label="Subtipo de cese"
                                disabled={!canEdit || !formData.tipo_cese}
                            >
                                <MenuItem value="">Sin especificar</MenuItem>
                                {formData.tipo_cese === 'RESTITUCION_DERECHOS' && [
                                    <MenuItem key="RESTITUCION_FAMILIA_ORIGEN" value="RESTITUCION_FAMILIA_ORIGEN">Restitución a familia de origen</MenuItem>,
                                    <MenuItem key="RESTITUCION_FAMILIA_AMPLIADA" value="RESTITUCION_FAMILIA_AMPLIADA">Restitución a familia ampliada</MenuItem>
                                ]}
                                {formData.tipo_cese === 'ADOPCION' && [
                                    <MenuItem key="ADOPCION_PLENA" value="ADOPCION_PLENA">Adopción plena</MenuItem>,
                                    <MenuItem key="ADOPCION_SIMPLE" value="ADOPCION_SIMPLE">Adopción simple</MenuItem>
                                ]}
                                {formData.tipo_cese === 'OTRA_MEDIDA' && [
                                    <MenuItem key="CAMBIO_MPE" value="CAMBIO_MPE">Cambio a otra MPE</MenuItem>,
                                    <MenuItem key="CAMBIO_MPI" value="CAMBIO_MPI">Cambio a MPI</MenuItem>,
                                    <MenuItem key="CAMBIO_MPJ" value="CAMBIO_MPJ">Cambio a MPJ</MenuItem>
                                ]}
                            </Select>
                        </FormControl>
                    </Box>
                </Card>
            )}
        </Box>
    )
}
