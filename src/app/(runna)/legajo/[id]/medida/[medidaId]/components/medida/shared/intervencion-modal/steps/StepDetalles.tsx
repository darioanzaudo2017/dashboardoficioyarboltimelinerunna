import {
    Alert,
    Box,
    Card,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import type { IntervencionModalProps, RegistroIntervencion } from "../types"

interface StepDetallesProps {
    error: RegistroIntervencion["error"]
    clearErrors: RegistroIntervencion["clearErrors"]
    formData: RegistroIntervencion["formData"]
    updateField: RegistroIntervencion["updateField"]
    intervencion: RegistroIntervencion["intervencion"]
    validationErrors: RegistroIntervencion["validationErrors"]
    canEdit: RegistroIntervencion["canEdit"]
    isLoadingCatalogs: RegistroIntervencion["isLoadingCatalogs"]
    motivos: RegistroIntervencion["motivos"]
    subMotivos: RegistroIntervencion["subMotivos"]
    tiposDispositivo: RegistroIntervencion["tiposDispositivo"]
    subtiposDispositivo: any[]
    legajoData: IntervencionModalProps["legajoData"]
    tipoMedida: IntervencionModalProps["tipoMedida"]
    workflowPhase: IntervencionModalProps["workflowPhase"]
}

export function StepDetalles({
    error,
    clearErrors,
    formData,
    updateField,
    intervencion,
    validationErrors,
    canEdit,
    isLoadingCatalogs,
    motivos,
    subMotivos,
    tiposDispositivo,
    subtiposDispositivo,
    legajoData,
    tipoMedida,
    workflowPhase,
}: StepDetallesProps) {
    // Hay tipos de dispositivo sin subtipos en el catalogo (familia extensa,
    // familia comunitaria, etc.). En esos casos el campo no puede ser obligatorio
    // porque no habria opcion posible que elegir.
    const tieneSubtiposDisponibles = subtiposDispositivo.length > 0

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Error Alert */}
            {error && (
                <Alert severity="error" onClose={clearErrors}>
                    {error}
                </Alert>
            )}

            <Card elevation={2} sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DescriptionIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Detalles de la Intervención
                    </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1, mb: 1 }}>
                    {tipoMedida === 'MPE' && (workflowPhase === 'apertura' || workflowPhase === 'innovacion') && (
                        <>
                            <TextField
                                label="Origen de la demanda"
                                value={legajoData?.origen_demanda || ''}
                                required
                                disabled
                                error={!legajoData?.origen_demanda}
                                helperText={!legajoData?.origen_demanda ? 'Asocie una demanda de origen antes de continuar' : 'Dato tomado de la demanda vinculada'}
                            />

                            <TextField
                                label="Técnico a cargo"
                                value={legajoData?.tecnico_cargo || ''}
                                required
                                disabled
                                error={!legajoData?.tecnico_cargo}
                                helperText={!legajoData?.tecnico_cargo ? 'Asigne un técnico al legajo antes de continuar' : 'Dato tomado de la asignación vigente'}
                            />

                            <FormControl fullWidth required error={!!validationErrors.tipo_dispositivo_id}>
                                <InputLabel>Tipo de dispositivo</InputLabel>
                                <Select
                                    value={formData.tipo_dispositivo_id || ''}
                                    onChange={(e) => {
                                        updateField('tipo_dispositivo_id', Number(e.target.value))
                                        updateField('subtipo_dispositivo_id', null)
                                    }}
                                    label="Tipo de dispositivo"
                                    disabled={!canEdit || isLoadingCatalogs}
                                >
                                    <MenuItem value="">Seleccionar</MenuItem>
                                    {tiposDispositivo.map((tipo) => (
                                        <MenuItem key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {validationErrors.tipo_dispositivo_id && (
                                    <FormHelperText>{validationErrors.tipo_dispositivo_id}</FormHelperText>
                                )}
                            </FormControl>

                            <FormControl
                                fullWidth
                                required={tieneSubtiposDisponibles}
                                error={!!validationErrors.subtipo_dispositivo_id}
                            >
                                <InputLabel>Dispositivo de resguardo</InputLabel>
                                <Select
                                    value={formData.subtipo_dispositivo_id || ''}
                                    onChange={(e) => updateField('subtipo_dispositivo_id', e.target.value ? Number(e.target.value) : null)}
                                    label="Dispositivo de resguardo"
                                    disabled={!canEdit || !formData.tipo_dispositivo_id || isLoadingCatalogs || !tieneSubtiposDisponibles}
                                >
                                    <MenuItem value="">Seleccionar</MenuItem>
                                    {subtiposDispositivo.map((subtipo) => (
                                        <MenuItem key={subtipo.id} value={subtipo.id}>
                                            {subtipo.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {validationErrors.subtipo_dispositivo_id ? (
                                    <FormHelperText>{validationErrors.subtipo_dispositivo_id}</FormHelperText>
                                ) : !formData.tipo_dispositivo_id ? (
                                    <FormHelperText>Seleccione primero un tipo de dispositivo</FormHelperText>
                                ) : isLoadingCatalogs ? (
                                    <FormHelperText>Cargando dispositivos...</FormHelperText>
                                ) : !tieneSubtiposDisponibles ? (
                                    <FormHelperText>
                                        Este tipo de dispositivo no tiene dispositivos de resguardo cargados - puede continuar
                                    </FormHelperText>
                                ) : null}
                            </FormControl>
                        </>
                    )}

                    {/* Motivo and Submotivo only visible for APERTURA and INNOVACION */}
                    {(workflowPhase === 'apertura' || workflowPhase === 'innovacion') && (
                        <>
                            <FormControl fullWidth required error={!!validationErrors.motivo_id}>
                                <InputLabel>Motivo de Intervención</InputLabel>
                                <Select
                                    value={formData.motivo_id || ''}
                                    onChange={(e) => updateField('motivo_id', Number(e.target.value))}
                                    label="Motivo de Intervención"
                                    disabled={!canEdit || isLoadingCatalogs}
                                >
                                    <MenuItem value="">Seleccionar</MenuItem>
                                    {motivos.map((motivo) => (
                                        <MenuItem key={motivo.id} value={motivo.id}>
                                            {motivo.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {validationErrors.motivo_id && (
                                    <FormHelperText>{validationErrors.motivo_id}</FormHelperText>
                                )}
                            </FormControl>

                            <FormControl fullWidth required error={!!validationErrors.sub_motivo_id}>
                                <InputLabel>Submotivo</InputLabel>
                                <Select
                                    value={formData.sub_motivo_id || ''}
                                    onChange={(e) => updateField('sub_motivo_id', e.target.value ? Number(e.target.value) : null)}
                                    label="Submotivo"
                                    disabled={!canEdit || !formData.motivo_id || isLoadingCatalogs}
                                >
                                    <MenuItem value="">Seleccionar</MenuItem>
                                    {subMotivos.map((submotivo) => (
                                        <MenuItem key={submotivo.id} value={submotivo.id}>
                                            {submotivo.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {validationErrors.sub_motivo_id ? (
                                    <FormHelperText>{validationErrors.sub_motivo_id}</FormHelperText>
                                ) : !formData.motivo_id ? (
                                    <FormHelperText>Seleccione primero un motivo</FormHelperText>
                                ) : null}
                            </FormControl>
                        </>
                    )}

                    {/* Estado (read-only) */}
                    {intervencion && (
                        <TextField
                            label="Estado"
                            value={intervencion.estado_display}
                            disabled
                            variant="outlined"
                            helperText="El estado cambia según el flujo de aprobación"
                        />
                    )}
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                        gap: 1,
                    }}
                >
                    <TextField
                        label="Intervención específica"
                        multiline
                        rows={1}
                        fullWidth
                        value={formData.intervencion_especifica}
                        onChange={(e) => updateField('intervencion_especifica', e.target.value)}
                        placeholder="Descripción específica de la intervención realizada..."
                        required
                        disabled={!canEdit}
                        error={!!validationErrors.intervencion_especifica}
                        helperText={validationErrors.intervencion_especifica || "Obligatorio"}
                    />

                    <TextField
                        label={workflowPhase === 'cese' ? "Descripción detallada del cese" : "Descripción detallada"}
                        multiline
                        rows={1}
                        fullWidth
                        value={formData.descripcion_detallada}
                        onChange={(e) => updateField('descripcion_detallada', e.target.value)}
                        placeholder={workflowPhase === 'cese'
                            ? "Descripción detallada del proceso de cese..."
                            : "Descripción adicional o contexto de la intervención..."}
                        disabled={!canEdit}
                        helperText="Opcional - Proporcione contexto adicional si es necesario"
                    />

                    <TextField
                        label={workflowPhase === 'cese' ? "Motivo de Cese" : "Motivo de vulneraciones"}
                        multiline
                        rows={1}
                        fullWidth
                        value={formData.motivo_vulneraciones}
                        onChange={(e) => updateField('motivo_vulneraciones', e.target.value)}
                        placeholder={workflowPhase === 'cese'
                            ? "Describa el motivo del cese de la medida..."
                            : "Descripción de vulneraciones de derechos detectadas..."}
                        disabled={!canEdit}
                        helperText={workflowPhase === 'cese'
                            ? "Opcional - Describa el motivo del cese"
                            : "Opcional - Describa las vulneraciones de derechos si aplica"}
                    />
                </Box>
            </Card>
        </Box>
    )
}
