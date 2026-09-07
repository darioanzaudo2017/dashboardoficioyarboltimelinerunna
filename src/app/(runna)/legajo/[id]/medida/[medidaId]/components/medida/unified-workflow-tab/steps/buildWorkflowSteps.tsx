import { Box, Button, Alert, Typography } from "@mui/material"
import { AperturaSection } from "../../apertura-section"
import { NotaAvalSection } from "../../nota-aval-section"
import { InformeJuridicoSection } from "../../informe-juridico-section"
import { RatificacionJudicialSection } from "../../ratificacion-judicial-section"
import { InformeCierreSection } from "../../informe-cierre-section"
import { WorkflowStep } from "../../workflow-stepper"
import { WorkflowStepContent } from "../../workflow-step-content"
import {
  determineStepStatus,
  getStepName,
  getStepDescription,
  createStepProgress,
} from "../../../../utils/step-completion"
import type { EtapaDetailResponse } from "../../../../api/etapa-detail-api-service"
import type { MedidaDetailResponse } from "../../../../types/medida-api"
import type { WorkflowPhase } from "../../../../types/workflow"
import type { UnifiedWorkflowTabProps } from "../types"

interface BuildWorkflowStepsParams {
  activeStep: number
  setActiveStep: (v: number) => void
  totalSteps: number
  isMPI: boolean
  step1Completed: boolean
  step2Completed: boolean
  step3Completed: boolean
  step4Completed: boolean
  mpiStep2Completed: boolean
  mpiStep3Completed: boolean
  step2Progress: number
  step3Progress: number
  step4Progress: number
  step1Progress: number
  estadoActual: string
  aperturaData: { fecha: string; estado: string; equipo: string }
  medidaData: UnifiedWorkflowTabProps["medidaData"]
  medidaApiData?: MedidaDetailResponse
  legajoData?: UnifiedWorkflowTabProps["legajoData"]
  workflowPhase?: WorkflowPhase
  etapaDetail: EtapaDetailResponse | null
  etapaActualForThisTab: { id?: number; tipo_etapa?: string } | null
  refreshWorkflowData: () => void
  userLevel: number | undefined
  isSuperuser: boolean
  isEquipoLegal: boolean
  isJZ: boolean
}

/**
 * Construcción del array de pasos del workflow.
 * Cuerpo movido tal cual desde `unified-workflow-tab.tsx` (líneas 428-634).
 */
export const buildWorkflowSteps = ({
  activeStep,
  setActiveStep,
  totalSteps,
  isMPI,
  step1Completed,
  step2Completed,
  step3Completed,
  step4Completed,
  mpiStep2Completed,
  mpiStep3Completed,
  step1Progress,
  step2Progress,
  step3Progress,
  step4Progress,
  estadoActual,
  aperturaData,
  medidaData,
  medidaApiData,
  legajoData,
  workflowPhase,
  etapaDetail,
  etapaActualForThisTab,
  refreshWorkflowData,
  userLevel,
  isSuperuser,
  isEquipoLegal,
  isJZ,
}: BuildWorkflowStepsParams): WorkflowStep[] => {
  const steps: WorkflowStep[] = [
    {
      id: 1,
      label: getStepName(0),
      description: getStepDescription(0),
      status: determineStepStatus(0, activeStep, step1Completed, true),
      progress: createStepProgress(step1Progress, estadoActual),
      content: (
        <WorkflowStepContent
          stepNumber={0}
          totalSteps={totalSteps}
          status={determineStepStatus(0, activeStep, step1Completed, true)}
          isFirst={true}
          isLast={false}
          canContinue={step1Completed}
          onContinue={() => setActiveStep(1)}
          showNavigation={true}
        >
          <AperturaSection
            data={aperturaData}
            isActive={activeStep === 0}
            isCompleted={step1Completed}
            onViewForm={() => { }}
            medidaId={medidaData.id}
            tipoMedida={medidaData.tipo_medida}
            legajoData={legajoData}
            workflowPhase={workflowPhase}
            intervenciones={etapaDetail?.etapa.documentos.intervenciones ?? []}
            onWorkflowRefresh={refreshWorkflowData}
          />
        </WorkflowStepContent>
      ),
    },
    // MPI Specific Steps
    ...(isMPI ? [
      {
        id: 2,
        label: "Seguimiento",
        description: "Plan de trabajo y seguimiento de la medida",
        status: determineStepStatus(1, activeStep, mpiStep2Completed, step1Completed),
        progress: createStepProgress(mpiStep2Completed ? 100 : 0),
        content: (
          <WorkflowStepContent
            stepNumber={1}
            totalSteps={totalSteps}
            status={determineStepStatus(1, activeStep, mpiStep2Completed, step1Completed)}
            isFirst={false}
            isLast={false}
            canContinue={step1Completed}
            onContinue={() => setActiveStep(2)}
            onBack={() => setActiveStep(0)}
            showNavigation={true}
          >
            <Box sx={{ p: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                La apertura ha sido aprobada. Ahora puede realizar el seguimiento en la sección de Plan de Trabajo y luego proceder al cierre de la medida desde el siguiente paso.
              </Alert>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveStep(2)}
                disabled={estadoActual !== "PENDIENTE_DE_INFORME_DE_CIERRE" && estadoActual !== "CERRADA"}
              >
                Continuar al Informe de Cierre
              </Button>
            </Box>
          </WorkflowStepContent>
        ),
      },
      {
        id: 3,
        label: "Cierre de Medida",
        description: "Registro del informe final y cierre administrativo",
        status: determineStepStatus(2, activeStep, mpiStep3Completed, mpiStep2Completed),
        progress: createStepProgress(mpiStep3Completed ? 100 : 0),
        content: (
          <WorkflowStepContent
            stepNumber={2}
            totalSteps={totalSteps}
            status={determineStepStatus(2, activeStep, mpiStep3Completed, mpiStep2Completed)}
            isFirst={false}
            isLast={true}
            canContinue={mpiStep3Completed}
            onBack={() => setActiveStep(1)}
            showNavigation={true}
            customGuidance={
              <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                <Typography component="li" variant="body2">
                  <strong>Técnico:</strong> Registrar el Informe de Cierre de la medida
                </Typography>
                <Typography component="li" variant="body2">
                  Seleccionar el Tipo de Cese y fundamentar la decisión
                </Typography>
                <Typography component="li" variant="body2">
                  Adjuntar la documentación de cierre si corresponde
                </Typography>
              </Box>
            }
          >
            {medidaApiData && (
              <InformeCierreSection
                medidaId={medidaData.id}
                medidaApiData={medidaApiData}
                isJZ={isJZ}
                onRefresh={refreshWorkflowData}
              />
            )}
          </WorkflowStepContent>
        ),
      }
    ] : [
      {
        id: 2,
        label: getStepName(1),
        description: getStepDescription(1),
        status: determineStepStatus(1, activeStep, step2Completed, step1Completed),
        progress: createStepProgress(step2Progress),
        content: (
          <WorkflowStepContent
            stepNumber={1}
            totalSteps={totalSteps}
            status={determineStepStatus(1, activeStep, step2Completed, step1Completed)}
            isFirst={false}
            isLast={false}
            canContinue={step2Completed}
            onContinue={() => setActiveStep(2)}
            onBack={() => setActiveStep(0)}
            showNavigation={true}
          >
            <NotaAvalSection
              medidaId={medidaData.id}
              medidaNumero={medidaData.numero_medida}
              estadoActual={estadoActual}
              userLevel={userLevel}
              isSuperuser={isSuperuser}
              onNotaAvalCreated={refreshWorkflowData}
              etapaId={etapaDetail?.etapa.id}
              initialData={etapaDetail?.etapa.documentos.notas_aval}
            />
          </WorkflowStepContent>
        ),
      },
      {
        id: 3,
        label: getStepName(2),
        description: getStepDescription(2),
        status: determineStepStatus(2, activeStep, step3Completed, step2Completed),
        progress: createStepProgress(step3Progress),
        content: (
          <WorkflowStepContent
            stepNumber={2}
            totalSteps={totalSteps}
            status={determineStepStatus(2, activeStep, step3Completed, step2Completed)}
            isFirst={false}
            isLast={false}
            canContinue={step3Completed}
            onContinue={() => setActiveStep(3)}
            onBack={() => setActiveStep(1)}
            showNavigation={true}
          >
            <InformeJuridicoSection
              medidaId={medidaData.id}
              isEquipoLegal={isEquipoLegal}
              isSuperuser={isSuperuser}
              estadoActual={estadoActual}
              onInformeEnviado={refreshWorkflowData}
              etapaId={etapaDetail?.etapa.id}
              initialData={etapaDetail?.etapa.documentos.informes_juridicos}
            />
          </WorkflowStepContent>
        ),
      },
      {
        id: 4,
        label: getStepName(3),
        description: getStepDescription(3),
        status: determineStepStatus(3, activeStep, step4Completed, step3Completed),
        progress: createStepProgress(step4Progress),
        content: (
          <WorkflowStepContent
            stepNumber={3}
            totalSteps={totalSteps}
            status={determineStepStatus(3, activeStep, step4Completed, step3Completed)}
            isFirst={false}
            isLast={true}
            canContinue={step4Completed}
            onBack={() => setActiveStep(2)}
            showNavigation={true}
          >
            <RatificacionJudicialSection
              medidaId={medidaData.id}
              etapaId={etapaActualForThisTab?.id}
              isEquipoLegal={isEquipoLegal}
              isJZ={isJZ}
              isSuperuser={isSuperuser}
              estadoActual={estadoActual}
              tipoMedida={medidaData.tipo_medida}
              tipoEtapa={etapaActualForThisTab?.tipo_etapa}
              estadoVigencia={medidaData.estado_vigencia}
              onRatificacionRegistrada={refreshWorkflowData}
              initialData={etapaDetail?.etapa.documentos.ratificaciones}
            />
          </WorkflowStepContent>
        ),
      },
    ]),
  ]

  return steps
}
