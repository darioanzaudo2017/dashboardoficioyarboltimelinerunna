/**
 * Estado de los pasos del modal "Gestión de la etapa" para una MPI:
 * Registro de Intervención → Seguimiento → Cierre de Medida.
 *
 * Después de aprobar la intervención, la MPI pasa a PENDIENTE_DE_INFORME_DE_CIERRE
 * y corre el plan de trabajo: el Seguimiento está en curso, no completado. Termina
 * cuando se registra el informe de cierre (INFORME_DE_CIERRE_REDACTADO) o la
 * medida se cierra. El paso de Cierre se sigue habilitando con el registro
 * aprobado (ver buildWorkflowSteps).
 */
export interface MpiStepsCompletion {
  seguimientoCompletado: boolean
  cierreCompletado: boolean
}

const ESTADOS_CIERRE_REGISTRADO = ["INFORME_DE_CIERRE_REDACTADO", "CERRADA"]

export function getMpiStepsCompletion(estadoActual?: string | null): MpiStepsCompletion {
  const cierreCompletado = !!estadoActual && ESTADOS_CIERRE_REGISTRADO.includes(estadoActual)
  return {
    seguimientoCompletado: cierreCompletado,
    cierreCompletado,
  }
}
