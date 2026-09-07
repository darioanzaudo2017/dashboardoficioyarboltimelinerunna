import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    IconButton,
    Paper,
    Typography,
} from "@mui/material"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import DeleteIcon from "@mui/icons-material/Delete"
import DescriptionIcon from "@mui/icons-material/Description"
import { FileUploadSection } from "../../../file-upload-section"
import type { IntervencionModalProps, RegistroIntervencion } from "../../types"
import type { IntervencionFiles } from "../../hooks/useIntervencionFiles"
import type { InformeObligatorioHandlers } from "../../hooks/useInformeObligatorio"

interface DocumentosAdicionalesSectionProps {
    formData: RegistroIntervencion["formData"]
    intervencion: RegistroIntervencion["intervencion"]
    canEdit: RegistroIntervencion["canEdit"]
    isLoadingAdjuntos: RegistroIntervencion["isLoadingAdjuntos"]
    isUploadingAdjunto: RegistroIntervencion["isUploadingAdjunto"]
    tipoMedida: IntervencionModalProps["tipoMedida"]
    pendingFiles: File[]
    additionalMappedAdjuntos: IntervencionFiles["additionalMappedAdjuntos"]
    handleFileUpload: IntervencionFiles["handleFileUpload"]
    handleAddPendingFile: IntervencionFiles["handleAddPendingFile"]
    handleRemovePendingFile: IntervencionFiles["handleRemovePendingFile"]
    handleDeleteAdjunto: IntervencionFiles["handleDeleteAdjunto"]
    handleDownloadFile: IntervencionFiles["handleDownloadFile"]
    formatFileSize: InformeObligatorioHandlers["formatFileSize"]
}

export function DocumentosAdicionalesSection({
    formData,
    intervencion,
    canEdit,
    isLoadingAdjuntos,
    isUploadingAdjunto,
    tipoMedida,
    pendingFiles,
    additionalMappedAdjuntos,
    handleFileUpload,
    handleAddPendingFile,
    handleRemovePendingFile,
    handleDeleteAdjunto,
    handleDownloadFile,
    formatFileSize,
}: DocumentosAdicionalesSectionProps) {
    return (
        <>
            {/* ============================================================ */}
            {/* DOCUMENTOS ADICIONALES SECTION - Conditional based on informes ampliatorios */}
            {/* ============================================================ */}
            {formData.requiere_informes_ampliatorios && (
                <Card variant="outlined" sx={{ mt: 2, borderColor: 'secondary.light', bgcolor: 'rgba(156, 39, 176, 0.02)' }}>
                    <CardHeader
                        avatar={
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                <AttachFileIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                        }
                        title={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                                    3. Documentación Adicional (Opcional)
                                </Typography>
                            </Box>
                        }
                        subheader={tipoMedida === 'MPE'
                            ? "Actas de puesta en conocimiento y de resguardo, notificaciones a los responsables legales del cuidado personal y otros documentos como informes externos, constancias."
                            : "Adjunte actas, entrevistas, fotos u otros respaldos pertinentes."}
                        sx={{ py: 1.5 }}
                        action={
                            (intervencion ? additionalMappedAdjuntos.length : pendingFiles.length) > 0 && (
                                <Chip
                                    label={`${intervencion ? additionalMappedAdjuntos.length : pendingFiles.length} archivo${(intervencion ? additionalMappedAdjuntos.length : pendingFiles.length) !== 1 ? 's' : ''}`}
                                    color="secondary"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 'bold' }}
                                />
                            )
                        }
                    />
                    <CardContent sx={{ pt: 0 }}>
                        {intervencion ? (
                            // EXISTING INTERVENTION: Show uploaded files and allow more uploads
                            <FileUploadSection
                                files={additionalMappedAdjuntos}
                                isLoading={isLoadingAdjuntos}
                                onUpload={handleFileUpload}
                                onDownload={handleDownloadFile}
                                onDelete={handleDeleteAdjunto}
                                allowedTypes=".pdf,.jpg,.jpeg,.png"
                                maxSizeInMB={10}
                                disabled={!canEdit}
                                readOnly={!canEdit}
                                title=""
                                uploadButtonLabel="Seleccionar otros archivos"
                                emptyMessage="No hay documentos adicionales adjuntos."
                                isUploading={isUploadingAdjunto}
                                multiple={true}
                            />
                        ) : (
                            // NEW INTERVENTION: Allow queuing files for upload with creation
                            <>
                                {/* Pending files list */}
                                {pendingFiles.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main' }}>
                                            Archivos seleccionados ({pendingFiles.length}):
                                        </Typography>
                                        {pendingFiles.map((file, index) => (
                                            <Paper
                                                key={index}
                                                variant="outlined"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: 1.5,
                                                    mb: 1,
                                                    bgcolor: 'background.paper',
                                                    borderColor: 'secondary.light',
                                                    borderLeft: 4,
                                                    borderLeftColor: 'secondary.main'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <DescriptionIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{file.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ({formatFileSize(file.size)})
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemovePendingFile(index)}
                                                    title="Quitar archivo"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Paper>
                                        ))}
                                    </Box>
                                )}

                                {/* File input */}
                                <Paper
                                    variant="outlined"
                                    component="label"
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: 'secondary.light',
                                        borderRadius: 2,
                                        p: 3,
                                        textAlign: 'center',
                                        cursor: canEdit ? 'pointer' : 'not-allowed',
                                        backgroundColor: 'rgba(156, 39, 176, 0.04)',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        gap: 1,
                                        '&:hover': {
                                            backgroundColor: canEdit ? 'rgba(156, 39, 176, 0.08)' : 'rgba(156, 39, 176, 0.04)',
                                            borderColor: 'secondary.main',
                                        },
                                    }}
                                >
                                    <CloudUploadIcon
                                        sx={{
                                            fontSize: 40,
                                            color: 'secondary.main',
                                            mb: 1,
                                            opacity: 0.7
                                        }}
                                    />
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'secondary.dark' }}>
                                        Agregar documentos adicionales
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Arrastre aquí o pulse para buscar (PDF, JPG, PNG)
                                    </Typography>
                                    <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple
                                        disabled={!canEdit}
                                        onChange={(e) => {
                                            const files = e.target.files
                                            if (files) {
                                                Array.from(files).forEach(file => {
                                                    handleAddPendingFile(file, 'RESPALDO')
                                                })
                                                e.target.value = '' // Reset to allow same file selection
                                            }
                                        }}
                                    />
                                </Paper>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    )
}
