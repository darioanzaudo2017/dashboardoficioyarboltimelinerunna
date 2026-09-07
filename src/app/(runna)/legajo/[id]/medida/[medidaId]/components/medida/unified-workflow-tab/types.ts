import type { WorkflowPhase } from "../../../types/workflow"
import type { MedidaDetailResponse } from "../../../types/medida-api"

export interface UnifiedWorkflowTabProps {
  /** Medida data (legacy format for V1 compatibility) */
  medidaData: {
    id: number
    tipo_medida: "MPE" | "MPI" | "MPJ"
    numero_medida?: string
    estado?: string
    fecha_apertura?: string
    [key: string]: any
  }

  /**
   * Full medida API response (V2 mode)
   * If provided and has etapa_actual.estado_especifico, enables V2 catalog-based workflow
   * If not provided or estado_especifico is null, falls back to V1 hardcoded workflow
   */
  medidaApiData?: MedidaDetailResponse

  /** Legajo data for context */
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
    origen_demanda?: string
    tecnico_cargo?: string
  }

  /** Workflow phase (apertura, innovacion, prorroga, cese) */
  workflowPhase?: WorkflowPhase

  /** Callback to refetch medida data from API after state changes */
  onMedidaRefetch?: () => void
}
