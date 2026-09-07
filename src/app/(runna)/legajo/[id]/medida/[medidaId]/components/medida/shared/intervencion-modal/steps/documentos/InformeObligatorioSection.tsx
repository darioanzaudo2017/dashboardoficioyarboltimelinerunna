import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import DeleteIcon from "@mui/icons-material/Delete"
import DescriptionIcon from "@mui/icons-material/Description"
import DownloadIcon from "@mui/icons-material/Download"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import type { RegistroIntervencion } from "../../types"
import type { IntervencionModalState } from "../../hooks/useIntervencionModalState"
import type { InformeObligatorioHandlers } from "../../hooks/useInformeObligatorio"

interface InformeObligatorioSectionProps {
    formData: RegistroIntervencion["formData"]
    updateField: RegistroIntervencion["updateField"]
    validationErrors: RegistroIntervencion["validationErrors"]
    canEdit: RegistroIntervencion["canEdit"]
    categorias: RegistroIntervencion["categorias"]
    isLoadingCatalogs: RegistroIntervencion["isLoadingCatalogs"]
    informeObligatorio: File | null
    informeObligatorioError: string | null
    setInformeObligatorioError: IntervencionModalState["setInformeObligatorioError"]
    isDraggingInformeObligatorio: boolean
    informeObligatorioInputRef: React.RefObject<HTMLInputElement>
    hasExistingInforme: boolean
    existingInformeName: string | null
    formatFileSize: InformeObligatorioHandlers["formatFileSize"]
    handleDownloadTemplate: InformeObligatorioHandlers["handleDownloadTemplate"]
    handleInformeObligatorioSelect: InformeObligatorioHandlers["handleInformeObligatorioSelect"]
    handleRemoveInformeObligatorio: InformeObligatorioHandlers["handleRemoveInformeObligatorio"]
    handleInformeObligatorioDragEnter: InformeObligatorioHandlers["handleInformeObligatorioDragEnter"]
    handleInformeObligatorioDragLeave: InformeObligatorioHandlers["handleInformeObligatorioDragLeave"]
    handleInformeObligatorioDragOver: InformeObligatorioHandlers["handleInformeObligatorioDragOver"]
    handleInformeObligatorioDrop: InformeObligatorioHandlers["handleInformeObligatorioDrop"]
}

export function InformeObligatorioSection({
    formData,
    updateField,
    validationErrors,
    canEdit,
    categorias,
    isLoadingCatalogs,
    informeObligatorio,
    informeObligatorioError,
    setInformeObligatorioError,
    isDraggingInformeObligatorio,
    informeObligatorioInputRef,
    hasExistingInforme,
    existingInformeName,
    formatFileSize,
    handleDownloadTemplate,
    handleInformeObligatorioSelect,
    handleRemoveInformeObligatorio,
    handleInformeObligatorioDragEnter,
    handleInformeObligatorioDragLeave,
    handleInformeObligatorioDragOver,
    handleInformeObligatorioDrop,
}: InformeObligatorioSectionProps) {
    return (
        <>
            {/* ============================================================ */}
            {/* INFORME OBLIGATORIO SECTION (Required) */}
            {/* ============================================================ */}
            <Card
                variant="outlined"
                sx={{
                    borderColor: informeObligatorioError ? 'error.main' : informeObligatorio ? 'success.main' : 'divider',
                    borderWidth: informeObligatorio ? 2 : 1,
                }}
            >
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: informeObligatorio ? 'success.main' : 'primary.main' }}>
                            <DescriptionIcon />
                        </Avatar>
                    }
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                                1. Informe Obligatorio de Apertura
                            </Typography>
                            <Chip
                                label={(informeObligatorio || hasExistingInforme) ? "Cargado" : "Pendiente"}
                                size="small"
                                color={(informeObligatorio || hasExistingInforme) ? "success" : "info"}
                                variant={(informeObligatorio || hasExistingInforme) ? "filled" : "outlined"}
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>
                    }
                    subheader="Este documento es la pieza central de la intervención y debe ser cargado primero."
                    sx={{ pb: 0 }}
                    action={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                variant="text"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadTemplate}
                                sx={{ textTransform: 'none' }}
                            >
                                Ver Plantilla
                            </Button>
                        </Box>
                    }
                />
                <CardContent sx={{ pt: 1 }}>
                    <FormControl
                        fullWidth
                        required
                        error={!!validationErrors.categoria_intervencion_id}
                        sx={{ mb: 2 }}
                    >
                        <InputLabel>Categoría del informe</InputLabel>
                        <Select
                            value={formData.categoria_intervencion_id || ''}
                            onChange={(e) => updateField('categoria_intervencion_id', Number(e.target.value))}
                            label="Categoría del informe"
                            disabled={!canEdit || isLoadingCatalogs}
                        >
                            <MenuItem value="">Seleccionar</MenuItem>
                            {categorias.map((categoria) => (
                                <MenuItem key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                            {validationErrors.categoria_intervencion_id
                                || 'Clasifica el documento para el repositorio y los reportes.'}
                        </FormHelperText>
                    </FormControl>

                    {informeObligatorio ? (
                        // NEWLY Uploaded file
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                bgcolor: 'success.50',
                                borderColor: 'success.300',
                                borderWidth: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                boxShadow: '0 2px 8px rgba(0, 128, 0, 0.1)',
                            }}
                        >
                            <PictureAsPdfIcon color="error" sx={{ fontSize: 48 }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.dark' }}>
                                    {informeObligatorio.name} (Listo para subir)
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatFileSize(informeObligatorio.size)} • PDF
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                                    Archivo seleccionado correctamente
                                </Typography>
                            </Box>
                            {canEdit && (
                                <IconButton
                                    onClick={handleRemoveInformeObligatorio}
                                    color="error"
                                    size="large"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Paper>
                    ) : hasExistingInforme ? (
                        // PREVIOUSLY Uploaded file (found in adjuntos)
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                bgcolor: 'info.50',
                                borderColor: 'primary.light',
                                borderWidth: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 6,
                                    bgcolor: 'primary.main',
                                }
                            }}
                        >
                            <PictureAsPdfIcon color="primary" sx={{ fontSize: 48 }} />
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                                        {existingInformeName}
                                    </Typography>
                                    <Chip label="Documento Base" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Este documento ya forma parte del expediente.
                                </Typography>
                                <Button
                                    variant="text"
                                    size="small"
                                    color="primary"
                                    startIcon={<UploadFileIcon />}
                                    disabled={!canEdit}
                                    onClick={() => informeObligatorioInputRef.current?.click()}
                                    sx={{ mt: 0.5, p: 0, minWidth: 0, textTransform: 'none' }}
                                >
                                    Haga clic aquí si desea reemplazarlo por una nueva versión
                                </Button>
                            </Box>
                            <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                        </Paper>
                    ) : (
                        // No file - DRAG & DROP ZONE
                        <Paper
                            onDragEnter={handleInformeObligatorioDragEnter}
                            onDragOver={handleInformeObligatorioDragOver}
                            onDragLeave={handleInformeObligatorioDragLeave}
                            onDrop={handleInformeObligatorioDrop}
                            onClick={() => canEdit && informeObligatorioInputRef.current?.click()}
                            sx={{
                                border: '2px dashed',
                                borderColor: isDraggingInformeObligatorio ? 'primary.main' : informeObligatorioError ? 'error.main' : 'primary.light',
                                borderRadius: 2,
                                p: 5,
                                textAlign: 'center',
                                cursor: canEdit ? 'pointer' : 'not-allowed',
                                backgroundColor: isDraggingInformeObligatorio ? 'action.hover' : 'primary.50',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                '&:hover': {
                                    backgroundColor: canEdit ? 'rgba(25, 118, 210, 0.08)' : 'primary.50',
                                    borderColor: 'primary.main',
                                },
                            }}
                        >
                            <CloudUploadIcon
                                sx={{
                                    fontSize: 64,
                                    color: 'primary.main',
                                    mb: 2,
                                    opacity: 0.8,
                                }}
                            />
                            <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: 'primary.dark' }}>
                                {isDraggingInformeObligatorio ? "Suelte el archivo" : "Subir Informe Obligatorio"}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                Pulse aquí para buscar el archivo o arrástrelo y suéltelo
                            </Typography>
                            <Typography variant="caption" sx={{
                                display: 'inline-block',
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                                px: 1.5, py: 0.5, borderRadius: 10,
                                fontWeight: 600
                            }}>
                                PDF • MÁX 10MB
                            </Typography>
                            <input
                                ref={informeObligatorioInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                style={{ display: 'none' }}
                                onChange={handleInformeObligatorioSelect}
                                disabled={!canEdit}
                            />
                        </Paper>
                    )}

                    {/* Error message */}
                    {informeObligatorioError && (
                        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setInformeObligatorioError(null)}>
                            {informeObligatorioError}
                        </Alert>
                    )}

                    {/* Warning if no file */}
                    {!informeObligatorio && !hasExistingInforme && !informeObligatorioError && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Este documento es obligatorio para guardar y enviar la intervención.
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </>
    )
}
