import type { IntervencionModalProps, RegistroIntervencion } from "../types"
import type { IntervencionModalState } from "../hooks/useIntervencionModalState"

interface IntervencionActionsParams {
    validateForm: RegistroIntervencion["validateForm"]
    guardarBorrador: RegistroIntervencion["guardarBorrador"]
    guardarYEnviar: RegistroIntervencion["guardarYEnviar"]
    uploadAdjuntoFile: RegistroIntervencion["uploadAdjuntoFile"]
    enviar: RegistroIntervencion["enviar"]
    aprobar: RegistroIntervencion["aprobar"]
    rechazar: RegistroIntervencion["rechazar"]
    intervencion: RegistroIntervencion["intervencion"]
    intervencionId: IntervencionModalProps["intervencionId"]
    onSaved: IntervencionModalProps["onSaved"]
    onClose: IntervencionModalProps["onClose"]
    activeStep: number
    setActiveStep: IntervencionModalState["setActiveStep"]
    snackbar: IntervencionModalState["snackbar"]
    setSnackbar: IntervencionModalState["setSnackbar"]
    informeObligatorio: File | null
    setInformeObligatorio: IntervencionModalState["setInformeObligatorio"]
    setInformeObligatorioError: IntervencionModalState["setInformeObligatorioError"]
    hasExistingInforme: boolean
    pendingFiles: File[]
    setPendingFiles: IntervencionModalState["setPendingFiles"]
    pendingFileTipos: string[]
    setPendingFileTipos: IntervencionModalState["setPendingFileTipos"]
    setRechazarDialogOpen: IntervencionModalState["setRechazarDialogOpen"]
}

/**
 * Handlers de guardado y transiciones de estado del modal de intervención.
 */
export function createIntervencionActions({
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
}: IntervencionActionsParams) {
    // ============================================================================
    // HANDLERS - Save & State Transitions
    // ============================================================================

    /**
     * Combined handler: Save intervention + send for approval
     * Uses guardarYEnviar for new interventions (single API call with files)
     * Uses guardarBorrador + enviar for existing interventions
     */
    const handleSaveAndSend = async () => {
        try {
            const formErrors = validateForm()
            if (Object.keys(formErrors).length > 0) {
                const firstError = Object.values(formErrors)[0]
                setSnackbar({ open: true, message: firstError, severity: 'error' })
                setActiveStep(1)
                return
            }

            // Validate mandatory document: New file OR existing file must be present
            if (!informeObligatorio && !hasExistingInforme) {
                setInformeObligatorioError('El Informe Obligatorio es requerido para enviar la intervención')
                setSnackbar({
                    open: true,
                    message: 'Debe adjuntar el Informe Obligatorio antes de guardar y enviar',
                    severity: 'error'
                })
                // Navigate to step 3 (Documentos) if not already there
                if (activeStep !== 2) {
                    setActiveStep(2)
                }
                return
            }

            const isNewIntervention = !intervencion && !intervencionId

            if (isNewIntervention) {
                // NEW INTERVENTION: Use combined endpoint (create + send + files in one call)
                setSnackbar({
                    open: true,
                    message: 'Creando y enviando intervención...',
                    severity: 'info'
                })

                // Combine informeObligatorio with pending files (filter out null)
                const allFiles = [informeObligatorio, ...pendingFiles].filter((f): f is File => f !== null)
                const allFileTipos = ['INFORME', ...pendingFileTipos]

                const result = await guardarYEnviar(
                    allFiles.length > 0 ? allFiles : undefined,
                    allFileTipos.length > 0 ? allFileTipos : undefined
                )

                if (result) {
                    // Clear pending files and mandatory document after successful creation
                    setPendingFiles([])
                    setPendingFileTipos([])
                    setInformeObligatorio(null)
                    setInformeObligatorioError(null)

                    setSnackbar({
                        open: true,
                        message: 'Intervención creada y enviada a aprobación exitosamente',
                        severity: 'success'
                    })
                    if (onSaved) {
                        onSaved()
                    }
                    setTimeout(() => {
                        onClose()
                    }, 1500)
                } else {
                    setSnackbar({
                        open: true,
                        message: 'Error al crear la intervención',
                        severity: 'error'
                    })
                }
            } else {
                // EXISTING INTERVENTION: Use two-step flow (save + send)
                setSnackbar({
                    open: true,
                    message: 'Guardando intervención...',
                    severity: 'info'
                })

                // Upload informe obligatorio first (if not already uploaded)
                if (informeObligatorio) {
                    setSnackbar({
                        open: true,
                        message: 'Subiendo informe obligatorio...',
                        severity: 'info'
                    })
                    await uploadAdjuntoFile(informeObligatorio, 'INFORME')
                }

                const result = await guardarBorrador()
                if (!result) {
                    setSnackbar({
                        open: true,
                        message: 'Error al guardar la intervención',
                        severity: 'error'
                    })
                    return
                }

                setSnackbar({
                    open: true,
                    message: 'Enviando a aprobación...',
                    severity: 'info'
                })

                // Small delay to ensure state is updated
                await new Promise(resolve => setTimeout(resolve, 300))

                const sendResult = await enviar()
                if (sendResult) {
                    // Clear mandatory document after successful upload
                    setInformeObligatorio(null)
                    setInformeObligatorioError(null)

                    setSnackbar({
                        open: true,
                        message: 'Intervención guardada y enviada a aprobación exitosamente',
                        severity: 'success'
                    })
                    if (onSaved) {
                        onSaved()
                    }
                    setTimeout(() => {
                        onClose()
                    }, 1500)
                }
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al procesar la intervención',
                severity: 'error'
            })
        }
    }

    /**
     * Handler: Save draft only (no send)
     * Allows editing and saving without sending for approval
     */
    const handleSaveDraft = async () => {
        try {
            setSnackbar({
                open: true,
                message: 'Guardando borrador...',
                severity: 'info'
            })

            const result = await guardarBorrador()
            if (result) {
                setSnackbar({
                    open: true,
                    message: 'Borrador guardado exitosamente',
                    severity: 'success'
                })
                if (onSaved) {
                    onSaved()
                }
                setTimeout(() => {
                    onClose()
                }, 1500)
            } else {
                setSnackbar({
                    open: true,
                    message: 'Error al guardar el borrador',
                    severity: 'error'
                })
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al guardar el borrador',
                severity: 'error'
            })
        }
    }

    const handleAprobar = async () => {
        try {
            const result = await aprobar()
            if (result) {
                setSnackbar({
                    open: true,
                    message: 'Intervención aprobada exitosamente',
                    severity: 'success'
                })
                if (onSaved) {
                    onSaved()
                }
                setTimeout(() => {
                    onClose()
                }, 1500)
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al aprobar la intervención',
                severity: 'error'
            })
        }
    }

    const handleRechazarClick = () => {
        setRechazarDialogOpen(true)
    }

    const handleRechazarConfirm = async (observaciones: string) => {
        try {
            const result = await rechazar(observaciones)
            if (result) {
                setSnackbar({
                    open: true,
                    message: 'Intervención rechazada. Se notificará al equipo técnico.',
                    severity: 'success'
                })
                setRechazarDialogOpen(false)
                if (onSaved) {
                    onSaved()
                }
                setTimeout(() => {
                    onClose()
                }, 1500)
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al rechazar la intervención',
                severity: 'error'
            })
        }
    }

    const handleRechazarCancel = () => {
        setRechazarDialogOpen(false)
    }

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false })
    }

    return {
        handleSaveAndSend,
        handleSaveDraft,
        handleAprobar,
        handleRechazarClick,
        handleRechazarConfirm,
        handleRechazarCancel,
        handleSnackbarClose,
    }
}
