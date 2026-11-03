import { useState } from "react"
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    IconButton,
    MenuItem,
    Paper,
    TextField,
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

/**
 * Tipos de documento que el servidor distingue: las actas van como ACTA; las notificaciones a padres o familiares
 * y cualquier otro anexo van como RESPALDO (hoy no tienen tipos propios).
 */
const TIPOS_DOCUMENTACION = [
    { value: "RESPALDO", label: "Notificación u otro anexo" },
    { value: "ACTA", label: "Acta" },
] as const

const TEXTO_AYUDA_MPE =
    "No es obligatoria, pero conviene adjuntarla: notificaciones a padres o familiares, actas y cualquier anexo de información complementaria que ayude a explicar por qué se toma la medida."

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
    const [tipoDocumento, setTipoDocumento] = useState<string>("RESPALDO")

    return (
        <>
            {/* ============================================================ */}
            {/* DOCUMENTACIÓN COMPLEMENTARIA - opcional, siempre a la vista */}
            {/* ============================================================ */}
            {(
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
                                    2. Documentación complementaria (opcional)
                                </Typography>
                            </Box>
                        }
                        subheader={tipoMedida === 'MPE'
                            ? TEXTO_AYUDA_MPE
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
                        {canEdit && (
                            <TextField
                                select
                                size="small"
                                label="Tipo de documento a adjuntar"
                                value={tipoDocumento}
                                onChange={(e) => setTipoDocumento(e.target.value)}
                                sx={{ mb: 2, minWidth: 260 }}
                            >
                                {TIPOS_DOCUMENTACION.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>
                                        {t.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        {intervencion ? (
                            // EXISTING INTERVENTION: Show uploaded files and allow more uploads
                            <FileUploadSection
                                files={additionalMappedAdjuntos}
                                isLoading={isLoadingAdjuntos}
                                onUpload={(file) => handleFileUpload(file, tipoDocumento)}
                                onDownload={handleDownloadFile}
                                onDelete={handleDeleteAdjunto}
                                allowedTypes=".pdf,.jpg,.jpeg,.png"
                                maxSizeInMB={10}
                                disabled={!canEdit}
                                readOnly={!canEdit}
                                title=""
                                uploadButtonLabel="Adjuntar documentos"
                                emptyMessage="Todavía no se adjuntó documentación complementaria."
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
                                        Adjuntar documentación complementaria
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
                                                    handleAddPendingFile(file, tipoDocumento)
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
