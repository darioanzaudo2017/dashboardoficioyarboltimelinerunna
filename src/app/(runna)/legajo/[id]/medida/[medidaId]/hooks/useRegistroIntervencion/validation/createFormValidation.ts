import type { TipoDispositivoWithSubtipos } from "../../../api/intervenciones-api-service"
import type {
  IntervencionFormData,
  UseRegistroIntervencionOptions,
  ValidationErrors,
} from "../types"

interface FormValidationParams {
  formData: IntervencionFormData
  workflowPhase: UseRegistroIntervencionOptions["workflowPhase"]
  tipoMedida: UseRegistroIntervencionOptions["tipoMedida"]
  tiposDispositivo: TipoDispositivoWithSubtipos[]
}

export function createFormValidation({
  formData,
  workflowPhase,
  tipoMedida,
  tiposDispositivo,
}: FormValidationParams) {
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
      // El dispositivo de resguardo solo es exigible cuando el tipo elegido
      // tiene subtipos cargados en el catálogo. Hay tipos (ej. familia extensa,
      // familia comunitaria) que no tienen dispositivos asociados: exigirlo ahí
      // dejaba el formulario sin forma de avanzar.
      const tipoSeleccionado = tiposDispositivo.find(
        (tipo) => tipo.id === formData.tipo_dispositivo_id
      )
      const tieneSubtipos = (tipoSeleccionado?.subtipos?.length ?? 0) > 0

      if (tieneSubtipos && !formData.subtipo_dispositivo_id) {
        errors.subtipo_dispositivo_id = "El dispositivo de resguardo es obligatorio"
      }
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
