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
    /** Tipo (ACTA, RESPALDO…) de cada archivo de `pendingFiles`, en el mismo orden. */
    pendingFileTipos: string[]
    additionalMappedAdjuntos: IntervencionFiles["additionalMappedAdjuntos"]
    handleFileUpload: IntervencionFiles["handleFileUpload"]
    handleAddPendingFile: IntervencionFiles["handleAddPendingFile"]
    handleRemovePendingFile: IntervencionFiles["handleRemovePendingFile"]
    handleDeleteAdjunto: IntervencionFiles["handleDeleteAdjunto"]
    handleDownloadFile: IntervencionFiles["handleDownloadFile"]
    formatFileSize: InformeObligatorioHandlers["formatFileSize"]
}

/** Tipo con el que el servidor guarda lo que se adjunta en cada contenedor. */
const TIPO_NOTIFICACIONES_ACTAS = "ACTA"
const TIPO_COMPLEMENTARIA = "RESPALDO"

interface ContenedorAdjuntosProps extends DocumentosAdicionalesSectionProps {
    titulo: string
    descripcion: string
    /** Tipo con el que se guardan los archivos de este contenedor. */
    tipo: string
    textoDropzone: string
    textoVacio: string
    /** Decide si un adjunto (por su tipo) pertenece a este contenedor. */
    pertenece: (tipoAdjunto: string) => boolean
}

function ContenedorAdjuntos({
    canEdit,
    intervencion,
    isLoadingAdjuntos,
    isUploadingAdjunto,
    pendingFiles,
    pendingFileTipos,
    additionalMappedAdjuntos,
    handleFileUpload,
    handleAddPendingFile,
    handleRemovePendingFile,
    handleDeleteAdjunto,
    handleDownloadFile,
    formatFileSize,
    titulo,
    descripcion,
    tipo,
    textoDropzone,
    textoVacio,
    pertenece,
}: ContenedorAdjuntosProps) {
    const guardados = additionalMappedAdjuntos.filter((a) => pertenece(String(a.tipo ?? "")))
    // Archivos elegidos antes de crear la intervención que van a este contenedor (con su posición en la cola general).
    const pendientes = pendingFiles
        .map((file, index) => ({ file, index }))
        .filter(({ index }) => pertenece(pendingFileTipos[index] ?? TIPO_COMPLEMENTARIA))
    const cantidad = intervencion ? guardados.length : pendientes.length

    return (
        <Card variant="outlined" sx={{ mt: 2, borderColor: 'secondary.light', bgcolor: 'rgba(156, 39, 176, 0.02)' }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                        <AttachFileIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                }
                title={
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                        {titulo}
                    </Typography>
                }
                subheader={descripcion}
                sx={{ py: 1.5 }}
                action={
                    cantidad > 0 && (
                        <Chip
                            label={`${cantidad} archivo${cantidad !== 1 ? 's' : ''}`}
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
                    // Intervención ya creada: se ven los archivos guardados y se pueden subir más
                    <FileUploadSection
                        files={guardados}
                        isLoading={isLoadingAdjuntos}
                        onUpload={(file) => handleFileUpload(file, tipo)}
                        onDownload={handleDownloadFile}
                        onDelete={handleDeleteAdjunto}
                        allowedTypes=".pdf,.jpg,.jpeg,.png"
                        maxSizeInMB={10}
                        disabled={!canEdit}
                        readOnly={!canEdit}
                        title=""
                        uploadButtonLabel="Adjuntar documentos"
                        emptyMessage={textoVacio}
                        isUploading={isUploadingAdjunto}
                        multiple={true}
                    />
                ) : (
                    // Intervención nueva: los archivos quedan en cola y se suben al crearla
                    <>
                        {pendientes.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main' }}>
                                    Archivos seleccionados ({pendientes.length}):
                                </Typography>
                                {pendientes.map(({ file, index }) => (
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
                            <CloudUploadIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1, opacity: 0.7 }} />
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'secondary.dark' }}>
                                {textoDropzone}
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
                                        Array.from(files).forEach((file) => handleAddPendingFile(file, tipo))
                                        e.target.value = '' // permite volver a elegir el mismo archivo
                                    }
                                }}
                            />
                        </Paper>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

/** Siempre visible: notificaciones a padres o familiares y actas (se guardan como ACTA). */
export function NotificacionesActasSection(props: DocumentosAdicionalesSectionProps) {
    return (
        <ContenedorAdjuntos
            {...props}
            titulo="2. Notificaciones y actas (opcional)"
            descripcion="Notificaciones a padres o familiares y actas (por ejemplo, de puesta en conocimiento y de resguardo)."
            tipo={TIPO_NOTIFICACIONES_ACTAS}
            textoDropzone="Adjuntar notificaciones y actas"
            textoVacio="Todavía no se adjuntaron notificaciones ni actas."
            pertenece={(t) => t === TIPO_NOTIFICACIONES_ACTAS}
        />
    )
}

/**
 * Anexos que ayudan a explicar la toma de la medida (se guardan como RESPALDO).
 * Se muestra cuando la pregunta de informes ampliatorios está en "Sí" (ver StepDocumentos).
 */
export function DocumentacionComplementariaSection(props: DocumentosAdicionalesSectionProps) {
    return (
        <ContenedorAdjuntos
            {...props}
            titulo="Documentación complementaria"
            descripcion="Cualquier anexo de información que ayude a explicar por qué se toma la medida: informes externos, constancias, fotos u otros respaldos."
            tipo={TIPO_COMPLEMENTARIA}
            textoDropzone="Adjuntar documentación complementaria"
            textoVacio="Todavía no se adjuntó documentación complementaria."
            pertenece={(t) => t !== TIPO_NOTIFICACIONES_ACTAS}
        />
    )
}

/** ¿Hay algo cargado (o en cola) que pertenezca a la documentación complementaria? */
export const hayDocumentacionComplementaria = (
    adjuntos: DocumentosAdicionalesSectionProps["additionalMappedAdjuntos"],
    pendingFileTipos: string[],
): boolean =>
    adjuntos.some((a) => String(a.tipo ?? "") !== TIPO_NOTIFICACIONES_ACTAS) ||
    pendingFileTipos.some((t) => t !== TIPO_NOTIFICACIONES_ACTAS)
