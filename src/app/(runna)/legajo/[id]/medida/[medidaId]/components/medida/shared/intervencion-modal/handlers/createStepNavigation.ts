import type { IntervencionModalProps, RegistroIntervencion } from "../types"
import type { IntervencionModalState } from "../hooks/useIntervencionModalState"

interface StepNavigationParams {
    validateForm: RegistroIntervencion["validateForm"]
    tipoMedida: IntervencionModalProps["tipoMedida"]
    workflowPhase: IntervencionModalProps["workflowPhase"]
    legajoData: IntervencionModalProps["legajoData"]
    activeStep: number
    setActiveStep: IntervencionModalState["setActiveStep"]
    setSnackbar: IntervencionModalState["setSnackbar"]
}

/**
 * Navegación y validación por paso del wizard.
 */
export function createStepNavigation({
    validateForm,
    tipoMedida,
    workflowPhase,
    legajoData,
    activeStep,
    setActiveStep,
    setSnackbar,
}: StepNavigationParams) {
    // ============================================================================
    // HANDLERS - Navigation
    // ============================================================================

    /**
     * Validate fields for a specific step
     * Returns true if valid, false if there are errors
     */
    const validateStep = (step: number): boolean => {
        const errors = validateForm()

        switch (step) {
            case 0: // Información Básica
                if (errors.fecha_intervencion) {
                    setSnackbar({
                        open: true,
                        message: errors.fecha_intervencion,
                        severity: 'error'
                    })
                    return false
                }
                return true

            case 1: // Detalles de Intervención
                const step1Errors: string[] = []
                if (tipoMedida === 'MPE' && (workflowPhase === 'apertura' || workflowPhase === 'innovacion')) {
                    if (!legajoData?.origen_demanda) step1Errors.push('La medida debe tener una demanda de origen asociada')
                    if (!legajoData?.tecnico_cargo) step1Errors.push('El legajo debe tener un técnico a cargo')
                }
                if (errors.tipo_dispositivo_id) step1Errors.push(errors.tipo_dispositivo_id)
                if (errors.subtipo_dispositivo_id) step1Errors.push(errors.subtipo_dispositivo_id)
                if (errors.motivo_id) step1Errors.push(errors.motivo_id)
                if (errors.sub_motivo_id) step1Errors.push(errors.sub_motivo_id)
                if (errors.intervencion_especifica) step1Errors.push(errors.intervencion_especifica)

                if (step1Errors.length > 0) {
                    setSnackbar({
                        open: true,
                        message: step1Errors[0], // Show first error
                        severity: 'error'
                    })
                    return false
                }
                return true

            default:
                return true
        }
    }

    const handleNext = () => {
        // Validate current step before proceeding
        if (!validateStep(activeStep)) {
            return
        }
        setActiveStep((prevStep) => Math.min(prevStep + 1, 2))
    }

    const handleBack = () => {
        setActiveStep((prevStep) => Math.max(prevStep - 1, 0))
    }

    const handleStepClick = (step: number) => {
        // Only allow clicking on previous steps or current step
        // To go forward, must use Next button which validates
        if (step <= activeStep) {
            setActiveStep(Math.min(Math.max(step, 0), 2))
        } else {
            // Validate all steps up to the target step
            for (let i = activeStep; i < step; i++) {
                if (!validateStep(i)) {
                    return
                }
            }
            setActiveStep(Math.min(Math.max(step, 0), 2))
        }
    }

    return { validateStep, handleNext, handleBack, handleStepClick }
}
