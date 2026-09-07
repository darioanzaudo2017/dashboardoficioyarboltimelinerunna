"use client"

/**
 * IntervencionModal - Reusable Intervention Registration Modal
 *
 * Unified modal component that works for MPI, MPE, and MPJ medida types.
 * Extracted and refactored from RegistroIntervencionModal for reusability.
 *
 * Features:
 * - 3-step wizard workflow (Información Básica → Detalles → Documentos y Configuración)
 * - Workflow states: BORRADOR → ENVIADO → APROBADO/RECHAZADO
 * - File attachment management
 * - Complete validation and error handling
 * - Reusable across MPI, MPE, and MPJ
 *
 * @see useRegistroIntervencion - Business logic hook (preserved as-is)
 */

import { Alert, Snackbar } from "@mui/material"
import React from "react"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import SendIcon from "@mui/icons-material/Send"
import SaveIcon from "@mui/icons-material/Save"

// Import atomic components
import { WizardModal, type WizardStep } from "../wizard-modal"
import { RejectionDialog } from "../rejection-dialog"

// Import business logic hook
import { useRegistroIntervencion } from "../../../../hooks/useRegistroIntervencion"

import { useIntervencionModalState } from "./hooks/useIntervencionModalState"
import { useIntervencionFiles } from "./hooks/useIntervencionFiles"
import { useInformeObligatorio } from "./hooks/useInformeObligatorio"
import { createStepNavigation } from "./handlers/createStepNavigation"
import { createIntervencionActions } from "./handlers/createIntervencionActions"
import { StepInformacionBasica } from "./steps/StepInformacionBasica"
import { StepDetalles } from "./steps/StepDetalles"
import { StepDocumentos } from "./steps/StepDocumentos"
import { getWorkflowPhaseDisplayName } from "./utils"
import type { IntervencionModalProps } from "./types"

// ============================================================================
// COMPONENT
// ============================================================================

export const IntervencionModal: React.FC<IntervencionModalProps> = ({
    open,
    onClose,
    medidaId,
    intervencionId,
    legajoData,
    tipoMedida = 'MPI',
    workflowPhase,
    onSaved
}) => {
    // ============================================================================
    // HOOK - Registro Intervención (PRESERVED AS-IS)
    // ============================================================================
    const {
        formData,
        updateField,
        intervencion,
        currentEstado,
        isLoading,
        isSaving,
        error,
        validationErrors,
        clearErrors,
        validateForm,
        guardarBorrador,
        guardarYEnviar,
        motivos,
        subMotivos,
        categorias,
        tiposDispositivo,
        isLoadingCatalogs,
        adjuntos,
        isLoadingAdjuntos,
        uploadAdjuntoFile,
        deleteAdjuntoFile,
        isUploadingAdjunto,
        canEdit,
        enviar,
        aprobar,
        rechazar,
        isEnviando,
        isAprobando,
        isRechazando,
        canAprobarOrRechazar,
    } = useRegistroIntervencion({
        medidaId: medidaId!,
        intervencionId,
        autoLoadCatalogs: true,
        workflowPhase,
        tipoMedida,
    })

    // ============================================================================
    // LOCAL STATE
    // ============================================================================
    const {
        activeStep,
        setActiveStep,
        showSuccessMessage,
        setShowSuccessMessage,
        rechazarDialogOpen,
        setRechazarDialogOpen,
        snackbar,
        setSnackbar,
        pendingFiles,
        setPendingFiles,
        pendingFileTipos,
        setPendingFileTipos,
        informeObligatorio,
        setInformeObligatorio,
        informeObligatorioError,
        setInformeObligatorioError,
        isDraggingInformeObligatorio,
        setIsDraggingInformeObligatorio,
        informeObligatorioInputRef,
        hasExistingInforme,
        existingInformeName,
    } = useIntervencionModalState({ open, medidaId, adjuntos, clearErrors })

    // Check if legajo data is available
    const hasLegajoData = !!(legajoData?.numero && legajoData?.persona_nombre && legajoData?.persona_apellido)

    // ============================================================================
    // HANDLERS - Navigation
    // ============================================================================

    const { handleNext, handleBack, handleStepClick } = createStepNavigation({
        validateForm,
        tipoMedida,
        workflowPhase,
        legajoData,
        activeStep,
        setActiveStep,
        setSnackbar,
    })

    // El catalogo /tipos-dispositivo/ devuelve las tres categorias (MPI/MPE/MPJ)
    // juntas. Mostramos solo los de la medida en curso; si el catalogo no tiene
    // ninguno de esa categoria (datos viejos sin categorizar) caemos al listado
    // completo para no dejar el selector vacio.
    const tiposDispositivoDeCategoria = tiposDispositivo.filter(
        (tipo) => tipo.categoria === tipoMedida
    )
    const tiposDispositivoVisibles =
        tiposDispositivoDeCategoria.length > 0 ? tiposDispositivoDeCategoria : tiposDispositivo

    const selectedTipoDispositivo = tiposDispositivo.find(
        (tipo) => tipo.id === formData.tipo_dispositivo_id
    )
    const subtiposDispositivo = selectedTipoDispositivo?.subtipos || []

    // ============================================================================
    // HANDLERS - Save & State Transitions
    // ============================================================================

    const {
        handleSaveAndSend,
        handleSaveDraft,
        handleAprobar,
        handleRechazarClick,
        handleRechazarConfirm,
        handleRechazarCancel,
        handleSnackbarClose,
    } = createIntervencionActions({
        validateForm,
        guardarBorrador,
        guardarYEnviar,
        uploadAdjuntoFile,
        enviar,
        aprobar,
        rechazar,
        intervencion,
        intervencionId,
        onSaved,
        onClose,
        activeStep,
        setActiveStep,
        snackbar,
        setSnackbar,
        informeObligatorio,
        setInformeObligatorio,
        setInformeObligatorioError,
        hasExistingInforme,
        pendingFiles,
        setPendingFiles,
        pendingFileTipos,
        setPendingFileTipos,
        setRechazarDialogOpen,
    })

    // ============================================================================
    // HANDLERS - File Management
    // ============================================================================

    const {
        handleFileUpload,
        handleAddPendingFile,
        handleRemovePendingFile,
        handleDeleteAdjunto,
        handleDownloadFile,
        additionalMappedAdjuntos,
    } = useIntervencionFiles({
        adjuntos,
        uploadAdjuntoFile,
        deleteAdjuntoFile,
        setPendingFiles,
        setPendingFileTipos,
    })

    // ============================================================================
    // HANDLERS - Informe Obligatorio (Mandatory Document)
    // ============================================================================

    const {
        formatFileSize,
        handleDownloadTemplate,
        handleInformeObligatorioSelect,
        handleRemoveInformeObligatorio,
        handleInformeObligatorioDragEnter,
        handleInformeObligatorioDragLeave,
        handleInformeObligatorioDragOver,
        handleInformeObligatorioDrop,
    } = useInformeObligatorio({
        canEdit,
        informeObligatorioInputRef,
        setInformeObligatorio,
        setInformeObligatorioError,
        setIsDraggingInformeObligatorio,
    })

    // ============================================================================
    // STEP CONTENT DEFINITIONS
    // ============================================================================

    const getStepContent = (step: number): React.ReactNode => {
        switch (step) {
            case 0: // Información Básica
                return (
                    <StepInformacionBasica
                        error={error}
                        clearErrors={clearErrors}
                        formData={formData}
                        updateField={updateField}
                        intervencion={intervencion}
                        validationErrors={validationErrors}
                        canEdit={canEdit}
                        hasLegajoData={hasLegajoData}
                        legajoData={legajoData}
                        workflowPhase={workflowPhase}
                    />
                )

            case 1: // Detalles de Intervención - PRESERVED as-is
                return (
                    <StepDetalles
                        error={error}
                        clearErrors={clearErrors}
                        formData={formData}
                        updateField={updateField}
                        intervencion={intervencion}
                        validationErrors={validationErrors}
                        canEdit={canEdit}
                        isLoadingCatalogs={isLoadingCatalogs}
                        motivos={motivos}
                        subMotivos={subMotivos}
                        tiposDispositivo={tiposDispositivoVisibles}
                        subtiposDispositivo={subtiposDispositivo}
                        legajoData={legajoData}
                        tipoMedida={tipoMedida}
                        workflowPhase={workflowPhase}
                    />
                )

            case 2: // Documentos y Configuración - MERGED from previous steps 2 and 3
                return (
                    <StepDocumentos
                        formData={formData}
                        updateField={updateField}
                        intervencion={intervencion}
                        validationErrors={validationErrors}
                        canEdit={canEdit}
                        canAprobarOrRechazar={canAprobarOrRechazar}
                        categorias={categorias}
                        isLoadingCatalogs={isLoadingCatalogs}
                        isLoadingAdjuntos={isLoadingAdjuntos}
                        isUploadingAdjunto={isUploadingAdjunto}
                        tipoMedida={tipoMedida}
                        informeObligatorio={informeObligatorio}
                        informeObligatorioError={informeObligatorioError}
                        setInformeObligatorioError={setInformeObligatorioError}
                        isDraggingInformeObligatorio={isDraggingInformeObligatorio}
                        informeObligatorioInputRef={informeObligatorioInputRef}
                        hasExistingInforme={hasExistingInforme}
                        existingInformeName={existingInformeName}
                        pendingFiles={pendingFiles}
                        additionalMappedAdjuntos={additionalMappedAdjuntos}
                        handleFileUpload={handleFileUpload}
                        handleAddPendingFile={handleAddPendingFile}
                        handleRemovePendingFile={handleRemovePendingFile}
                        handleDeleteAdjunto={handleDeleteAdjunto}
                        handleDownloadFile={handleDownloadFile}
                        formatFileSize={formatFileSize}
                        handleDownloadTemplate={handleDownloadTemplate}
                        handleInformeObligatorioSelect={handleInformeObligatorioSelect}
                        handleRemoveInformeObligatorio={handleRemoveInformeObligatorio}
                        handleInformeObligatorioDragEnter={handleInformeObligatorioDragEnter}
                        handleInformeObligatorioDragLeave={handleInformeObligatorioDragLeave}
                        handleInformeObligatorioDragOver={handleInformeObligatorioDragOver}
                        handleInformeObligatorioDrop={handleInformeObligatorioDrop}
                    />
                )

            default:
                return 'Paso desconocido'
        }
    }

    // ============================================================================
    // WIZARD STEPS CONFIGURATION
    // ============================================================================

    const wizardSteps: WizardStep[] = [
        { label: 'Información Básica', content: getStepContent(0) },
        { label: 'Detalles de Intervención', content: getStepContent(1) },
        { label: 'Documentos y Configuración', content: getStepContent(2) },
    ]

    // Dynamic title based on tipoMedida and workflowPhase
    const workflowPhaseDisplay = getWorkflowPhaseDisplayName(workflowPhase)
    const modalTitle = `Registro de Intervención ${tipoMedida}${workflowPhaseDisplay ? ` - ${workflowPhaseDisplay}` : ''}`

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <>
            {/* Main Wizard Modal - REFACTORED with atomic component */}
            <WizardModal
                open={open}
                onClose={onClose}
                title={modalTitle}
                steps={wizardSteps}
                activeStep={activeStep}
                onNext={handleNext}
                onBack={handleBack}
                onStepClick={handleStepClick}
                maxWidth="lg"
                fullWidth={true}
                showProgress={true}
                allowStepClick={true}
                primaryAction={
                    // Context-aware primary action
                    activeStep !== wizardSteps.length - 1
                        ? {
                            // Not on last step: just "Siguiente"
                            label: "Siguiente",
                            onClick: handleNext,
                            disabled: isLoading,
                        }
                        : canAprobarOrRechazar && currentEstado === 'ENVIADO'
                            ? {
                                // Reviewing: "Aprobar Intervención" as primary action
                                label: "Aprobar Intervención",
                                onClick: handleAprobar,
                                disabled: isAprobando || isRechazando || isLoading,
                                icon: <CheckCircleIcon />,
                            }
                            : {
                                // Creating/Editing: "Enviar para Aprobación" as single action
                                label: "Enviar para Aprobación",
                                onClick: handleSaveAndSend,
                                disabled: isSaving || isEnviando || isLoading,
                                icon: <SendIcon />,
                            }
                }
                secondaryActions={[
                    // Guardar Borrador button (for editing without sending)
                    ...(canEdit && activeStep === wizardSteps.length - 1 && !(canAprobarOrRechazar && currentEstado === 'ENVIADO') ? [{
                        label: "Guardar Borrador",
                        onClick: handleSaveDraft,
                        disabled: isSaving || isLoading,
                        variant: "outlined" as const,
                        color: "primary" as const,
                        icon: <SaveIcon />,
                    }] : []),
                    // Rechazar button (only for reviewers in ENVIADO state)
                    ...(canAprobarOrRechazar && currentEstado === 'ENVIADO' && activeStep === wizardSteps.length - 1 ? [{
                        label: "Rechazar Intervención",
                        onClick: handleRechazarClick,
                        disabled: isAprobando || isRechazando || isLoading,
                        variant: "outlined" as const,
                        color: "error" as const,
                    }] : []),
                ]}
            />

            {/* Rejection Dialog - PRESERVED (already using atomic component) */}
            <RejectionDialog
                open={rechazarDialogOpen}
                onClose={handleRechazarCancel}
                onConfirm={handleRechazarConfirm}
                title="Rechazar Intervención"
                description="Ingrese las observaciones o motivos del rechazo. Esta información será enviada al equipo técnico."
                observacionesLabel="Observaciones *"
                observacionesPlaceholder="Describa los motivos del rechazo..."
                confirmButtonLabel="Confirmar Rechazo"
                cancelButtonLabel="Cancelar"
                isSubmitting={isRechazando}
                minLength={10}
                required={true}
            />

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccessMessage}
                autoHideDuration={3000}
                onClose={() => setShowSuccessMessage(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowSuccessMessage(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                    icon={<CheckCircleIcon />}
                >
                    Intervención guardada exitosamente
                </Alert>
            </Snackbar>

            {/* State Transition Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}
