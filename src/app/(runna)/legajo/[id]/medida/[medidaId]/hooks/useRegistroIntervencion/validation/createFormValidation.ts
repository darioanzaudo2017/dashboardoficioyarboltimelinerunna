import type {
  IntervencionFormData,
  UseRegistroIntervencionOptions,
  ValidationErrors,
} from "../types"

interface FormValidationParams {
  formData: IntervencionFormData
  workflowPhase: UseRegistroIntervencionOptions["workflowPhase"]
  tipoMedida: UseRegistroIntervencionOptions["tipoMedida"]
}

export function createFormValidation({ formData, workflowPhase, tipoMedida }: FormValidationParams) {
  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate form data
   * Returns object with field errors
   */
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!formData.fecha_intervencion) {
      errors.fecha_intervencion = "La fecha de intervención es obligatoria"
    }

    // Motivo is only required for apertura and innovacion phases
    if ((workflowPhase === 'apertura' || workflowPhase === 'innovacion') && !formData.motivo_id) {
      errors.motivo_id = "El motivo es obligatorio"
    }

    if (
      (workflowPhase === 'apertura' || workflowPhase === 'innovacion')
      && !formData.sub_motivo_id
    ) {
      errors.sub_motivo_id = "El submotivo es obligatorio"
    }

    if (tipoMedida === 'MPE' && (workflowPhase === 'apertura' || workflowPhase === 'innovacion')) {
      if (!formData.tipo_dispositivo_id) {
        errors.tipo_dispositivo_id = "El tipo de dispositivo es obligatorio"
      }
      if (!formData.subtipo_dispositivo_id) {
        errors.subtipo_dispositivo_id = "El dispositivo de resguardo es obligatorio"
      }
    }

    if (!formData.categoria_intervencion_id) {
      errors.categoria_intervencion_id = "La categoría es obligatoria"
    }

    if (!formData.intervencion_especifica || formData.intervencion_especifica.trim() === "") {
      errors.intervencion_especifica = "La intervención específica es obligatoria"
    }

    return errors
  }

  /**
   * Check if form is valid
   */
  const isFormValid = (): boolean => {
    const errors = validateForm()
    return Object.keys(errors).length === 0
  }

  return { validateForm, isFormValid }
}
