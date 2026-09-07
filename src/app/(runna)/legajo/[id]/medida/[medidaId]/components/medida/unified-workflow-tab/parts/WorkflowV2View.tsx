import { Box } from "@mui/material"
import { WorkflowStepper } from "../../workflow-stepper"
import { InformeCierreSection } from "../../informe-cierre-section"
import { EtapaScopeIndicator } from "../../shared/EtapaScopeIndicator"
import { workflowPhaseToTipoEtapa } from "../../../../utils/workflow-tipo-mapper"
import type { MedidaDetailResponse } from "../../../../types/medida-api"
import type { TEstadoEtapaMedida } from "../../../../types/estado-etapa"
import type { WorkflowPhase } from "../../../../types/workflow"
import type { UnifiedWorkflowTabProps } from "../types"
import { ETAPA_LABELS } from "../constants"

interface WorkflowV2ViewProps {
  workflowPhase: WorkflowPhase
  etapaActualForThisTab: any
  medidaData: UnifiedWorkflowTabProps["medidaData"]
  medidaApiData?: MedidaDetailResponse
  availableEstadosFromEtapa: TEstadoEtapaMedida[]
  showInformeCierreSection: boolean
  legajoPrimarioForDialog: any
  legajosAdicionalesForDialog: any[]
  isJZ: boolean
  refreshWorkflowData: () => void
}

/**
 * Rama V2 del workflow (stepper basado en catálogo).
 * Movida tal cual desde `unified-workflow-tab.tsx` (líneas 798-842).
 *
 * NOTA: en el original `useV2Mode` es la constante `false`, así que esta rama
 * nunca se renderiza. Se preserva tal cual; ver "Bugs detectados" en el reporte.
 */
export const WorkflowV2View = ({
  workflowPhase,
  etapaActualForThisTab,
  medidaData,
  medidaApiData,
  availableEstadosFromEtapa,
  showInformeCierreSection,
  legajoPrimarioForDialog,
  legajosAdicionalesForDialog,
  isJZ,
  refreshWorkflowData,
}: WorkflowV2ViewProps) => (
      <>
        {/* Granularidad: indicador visual de si esta etapa es grupal o específica.
            Se auto-oculta cuando la medida tiene un único legajo. */}
        <EtapaScopeIndicator
          legajosAlcance={(etapaActualForThisTab as any)?.legajos_alcance}
          esGrupal={(etapaActualForThisTab as any)?.es_grupal}
          legajoPrimarioId={legajoPrimarioForDialog?.id}
          legajoPrimarioNumero={legajoPrimarioForDialog?.numero}
          legajoPrimarioNombre={
            legajoPrimarioForDialog
              ? `${legajoPrimarioForDialog.nnya.nombre} ${legajoPrimarioForDialog.nnya.apellido}`.trim()
              : undefined
          }
          legajosAdicionales={legajosAdicionalesForDialog}
          etapaLabel={ETAPA_LABELS[workflowPhase]}
        />

        <WorkflowStepper
          tipoMedida={medidaData.tipo_medida}
          tipoEtapa={workflowPhaseToTipoEtapa(workflowPhase)}
          etapaActual={etapaActualForThisTab}
          medidaId={medidaData.id}
          availableEstados={availableEstadosFromEtapa}
          fechaCeseEfectivo={medidaApiData?.fecha_cese_efectivo}
          planTrabajoId={medidaApiData?.plan_trabajo_id}
        />

        {/* MPI Closure Section (Estados 3-4) */}
        {showInformeCierreSection && medidaApiData && (
          <Box sx={{ mt: 3 }}>
            <InformeCierreSection
              medidaId={medidaData.id}
              medidaApiData={medidaApiData}
              isJZ={isJZ}
              onRefresh={refreshWorkflowData}
            />
          </Box>
        )}
      </>
    )
