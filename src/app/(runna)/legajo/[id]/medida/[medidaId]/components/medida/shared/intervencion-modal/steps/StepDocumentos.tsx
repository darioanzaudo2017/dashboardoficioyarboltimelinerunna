import { Box } from "@mui/material"
import { InformeObligatorioSection } from "./documentos/InformeObligatorioSection"
import { ConfiguracionAdicionalSection } from "./documentos/ConfiguracionAdicionalSection"
import { DocumentosAdicionalesSection } from "./documentos/DocumentosAdicionalesSection"
import type { IntervencionModalProps, RegistroIntervencion } from "../types"
import type { IntervencionModalState } from "../hooks/useIntervencionModalState"
import type { IntervencionFiles } from "../hooks/useIntervencionFiles"
import type { InformeObligatorioHandlers } from "../hooks/useInformeObligatorio"

interface StepDocumentosProps {
    formData: RegistroIntervencion["formData"]
    updateField: RegistroIntervencion["updateField"]
    intervencion: RegistroIntervencion["intervencion"]
    validationErrors: RegistroIntervencion["validationErrors"]
    canEdit: RegistroIntervencion["canEdit"]
    canAprobarOrRechazar: RegistroIntervencion["canAprobarOrRechazar"]
    categorias: RegistroIntervencion["categorias"]
    isLoadingCatalogs: RegistroIntervencion["isLoadingCatalogs"]
    isLoadingAdjuntos: RegistroIntervencion["isLoadingAdjuntos"]
    isUploadingAdjunto: RegistroIntervencion["isUploadingAdjunto"]
    tipoMedida: IntervencionModalProps["tipoMedida"]
    informeObligatorio: File | null
    informeObligatorioError: string | null
    setInformeObligatorioError: IntervencionModalState["setInformeObligatorioError"]
    isDraggingInformeObligatorio: boolean
    informeObligatorioInputRef: React.RefObject<HTMLInputElement>
    hasExistingInforme: boolean
    existingInformeName: string | null
    pendingFiles: File[]
    additionalMappedAdjuntos: IntervencionFiles["additionalMappedAdjuntos"]
    handleFileUpload: IntervencionFiles["handleFileUpload"]
    handleAddPendingFile: IntervencionFiles["handleAddPendingFile"]
    handleRemovePendingFile: IntervencionFiles["handleRemovePendingFile"]
    handleDeleteAdjunto: IntervencionFiles["handleDeleteAdjunto"]
    handleDownloadFile: IntervencionFiles["handleDownloadFile"]
    formatFileSize: InformeObligatorioHandlers["formatFileSize"]
    handleDownloadTemplate: InformeObligatorioHandlers["handleDownloadTemplate"]
    handleInformeObligatorioSelect: InformeObligatorioHandlers["handleInformeObligatorioSelect"]
    handleRemoveInformeObligatorio: InformeObligatorioHandlers["handleRemoveInformeObligatorio"]
    handleInformeObligatorioDragEnter: InformeObligatorioHandlers["handleInformeObligatorioDragEnter"]
    handleInformeObligatorioDragLeave: InformeObligatorioHandlers["handleInformeObligatorioDragLeave"]
    handleInformeObligatorioDragOver: InformeObligatorioHandlers["handleInformeObligatorioDragOver"]
    handleInformeObligatorioDrop: InformeObligatorioHandlers["handleInformeObligatorioDrop"]
}

export function StepDocumentos(props: StepDocumentosProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <InformeObligatorioSection
                formData={props.formData}
                canEdit={props.canEdit}
                informeObligatorio={props.informeObligatorio}
                informeObligatorioError={props.informeObligatorioError}
                setInformeObligatorioError={props.setInformeObligatorioError}
                isDraggingInformeObligatorio={props.isDraggingInformeObligatorio}
                informeObligatorioInputRef={props.informeObligatorioInputRef}
                hasExistingInforme={props.hasExistingInforme}
                existingInformeName={props.existingInformeName}
                formatFileSize={props.formatFileSize}
                handleDownloadTemplate={props.handleDownloadTemplate}
                handleInformeObligatorioSelect={props.handleInformeObligatorioSelect}
                handleRemoveInformeObligatorio={props.handleRemoveInformeObligatorio}
                handleInformeObligatorioDragEnter={props.handleInformeObligatorioDragEnter}
                handleInformeObligatorioDragLeave={props.handleInformeObligatorioDragLeave}
                handleInformeObligatorioDragOver={props.handleInformeObligatorioDragOver}
                handleInformeObligatorioDrop={props.handleInformeObligatorioDrop}
            />

            <ConfiguracionAdicionalSection
                formData={props.formData}
                updateField={props.updateField}
                intervencion={props.intervencion}
                canEdit={props.canEdit}
                canAprobarOrRechazar={props.canAprobarOrRechazar}
            />

            <DocumentosAdicionalesSection
                formData={props.formData}
                intervencion={props.intervencion}
                canEdit={props.canEdit}
                isLoadingAdjuntos={props.isLoadingAdjuntos}
                isUploadingAdjunto={props.isUploadingAdjunto}
                tipoMedida={props.tipoMedida}
                pendingFiles={props.pendingFiles}
                additionalMappedAdjuntos={props.additionalMappedAdjuntos}
                handleFileUpload={props.handleFileUpload}
                handleAddPendingFile={props.handleAddPendingFile}
                handleRemovePendingFile={props.handleRemovePendingFile}
                handleDeleteAdjunto={props.handleDeleteAdjunto}
                handleDownloadFile={props.handleDownloadFile}
                formatFileSize={props.formatFileSize}
            />
        </Box>
    )
}
