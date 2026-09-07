import { workflowPhaseToTipoEtapa } from "../../../utils/workflow-tipo-mapper"
import type { WorkflowPhase } from "../../../types/workflow"
import type { MedidaDetailResponse } from "../../../types/medida-api"

type EtapaActual = NonNullable<MedidaDetailResponse["etapa_actual"]>
type HistorialEtapa = NonNullable<MedidaDetailResponse["historial_etapas"]>[number]

/**
 * Etapas del historial que corresponden a la fase de esta pestaña.
 * Cuerpo movido tal cual desde el `React.useMemo` original.
 */
export const selectEtapasOfThisType = (
  medidaApiData: MedidaDetailResponse | undefined,
  workflowPhase: WorkflowPhase | undefined,
): HistorialEtapa[] => {
    if (!medidaApiData || !workflowPhase) return []
    const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)
    return (medidaApiData.historial_etapas ?? []).filter(
      (etapa) => etapa.tipo_etapa === tipoEtapa,
    )
}

/**
 * GAP-08: una MPE puede tener más de una etapa de INNOVACION/PRORROGA/CESE.
 * Cuando hay varias del mismo tipo, devolvemos la más reciente (mayor id;
 * `historial_etapas` viene de `medida.etapas.all()` sin orden garantizado).
 * Las anteriores quedan disponibles vía `etapasOfThisType` para mostrar el
 * historial.
 */
export const getEtapaForWorkflow = (
  medidaApiData: MedidaDetailResponse | undefined,
  workflowPhase: WorkflowPhase | undefined,
  etapasOfThisType: HistorialEtapa[],
): EtapaActual | null => {
    if (!medidaApiData || !workflowPhase) {
      return medidaApiData?.etapa_actual || null
    }

    if (etapasOfThisType.length === 0) return null

    // Most recent = highest id (etapas se crean secuencialmente)
    const latest = [...etapasOfThisType].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
    return latest || null
}

/**
 * GAP-08: ¿Se puede iniciar una nueva etapa del tipo de esta pestaña?
 * Espeja `TRANSICIONES_PERMITIDAS` del backend (med01_validaciones.py).
 * APERTURA siempre es false: una MPE tiene una sola APERTURA.
 *
 * El "origen" de la transición es el tipo de la etapa pendiente (`etapa_actual`).
 * Pero cuando la medida está VIGENTE no hay etapa pendiente (`etapa_actual` es
 * null) — y ese es justamente el momento en que se puede abrir una nueva
 * innovación/prórroga/cese. En ese caso tomamos el origen de la última etapa
 * del historial, que siempre trae `tipo_etapa`.
 */
export const computePuedeIniciarNuevaEtapa = (
  medidaApiData: MedidaDetailResponse | undefined,
  tipoMedida: string,
  workflowPhase: WorkflowPhase | undefined,
): boolean => {
    if (!medidaApiData || !workflowPhase) return false
    if (workflowPhase === "apertura") return false


    const historial = medidaApiData.historial_etapas ?? []
    const latestHist = [...historial].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
    const tipoOrigen = (medidaApiData.etapa_actual?.tipo_etapa ?? latestHist?.tipo_etapa) as
      | string
      | undefined
    if (!tipoOrigen) return false

    const tipoDestino = workflowPhaseToTipoEtapa(workflowPhase) as string

    const MPE_POST_APERTURA = ["INNOVACION", "PRORROGA", "CESE"]
    const TRANSICIONES: Record<string, Record<string, string[]>> = {
      MPI: { APERTURA: ["CESE"], CESE: [] },
      MPE: {
        APERTURA: MPE_POST_APERTURA,
        INNOVACION: MPE_POST_APERTURA,
        PRORROGA: MPE_POST_APERTURA,
        CESE: MPE_POST_APERTURA,
        POST_CESE: [],
      },
      MPJ: { APERTURA: ["PROCESO", "CESE"], PROCESO: ["CESE"], CESE: [] },
    }

    return (TRANSICIONES[tipoMedida]?.[tipoOrigen] ?? []).includes(tipoDestino)
}
