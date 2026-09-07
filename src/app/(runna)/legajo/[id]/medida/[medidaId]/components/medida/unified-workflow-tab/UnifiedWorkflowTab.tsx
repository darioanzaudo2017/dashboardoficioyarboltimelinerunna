"use client"

/**
 * Unified Workflow Tab Component - V2 Enhanced
 *
 * Dual-mode workflow stepper supporting both V1 and V2 architectures:
 *
 * V2 MODE (catalog-based estados):
 * - Fetches estados from TEstadoEtapaMedida catalog
 * - Filtered by tipo_medida + tipo_etapa
 * - Displays 1-5 estados with responsable_tipo and siguiente_accion
 * - Used when medidaApiData.etapa_actual.estado_especifico exists
 *
 * V1 MODE (legacy hardcoded workflow):
 * - Uses hardcoded 4-step workflow
 * - Backward compatible fallback
 * - Used when estado_especifico is null/undefined
 *
 * Workflow phases: Apertura, Innovación, Prórroga, Cese
 * Medida types: MPE, MPI, MPJ
 */


import React, { useEffect } from "react"
import { Box, CircularProgress, Button, Alert, Typography } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { useUser } from "@/utils/auth/userZustand"
import { WorkflowStepper } from "../workflow-stepper"
import {
  isIntervencionCompleted,
  isNotaAvalCompleted,
  isInformeJuridicoCompleted,
  isRatificacionCompleted,
} from "../../../utils/step-completion"
import { createEtapa } from "../../../api/etapa-api-service"
import { workflowPhaseToTipoEtapa } from "../../../utils/workflow-tipo-mapper"
import IniciarEtapaDialog from "../../dialogs/iniciar-etapa-dialog"
import { EtapaScopeIndicator } from "../shared/EtapaScopeIndicator"
import { useParams } from "next/navigation"
import type { TEstadoEtapaMedida } from "../../../types/estado-etapa"
import { logger } from "@/utils/logger"
import type { UnifiedWorkflowTabProps } from "./types"
import { ETAPA_LABELS } from "./constants"
import { deriveWorkflowPermissions } from "./permissions"
import {
  selectEtapasOfThisType,
  getEtapaForWorkflow,
  computePuedeIniciarNuevaEtapa,
} from "./etapa-selection"
import { useWorkflowState } from "./hooks/useWorkflowState"
import { loadEtapaDetail } from "./data/loadEtapaDetail"
import { buildWorkflowSteps } from "./steps/buildWorkflowSteps"
import { EtapaNotFoundView } from "./parts/EtapaNotFoundView"
import { EtapaHistorialSelector } from "./parts/EtapaHistorialSelector"
import { IniciarOtraEtapaBanner } from "./parts/IniciarOtraEtapaBanner"
import { WorkflowV2View } from "./parts/WorkflowV2View"

// ============================================================================
// COMPONENT
// ============================================================================

export const UnifiedWorkflowTab: React.FC<UnifiedWorkflowTabProps> = ({
  medidaData,
  medidaApiData,
  legajoData,
  workflowPhase = "apertura",
  onMedidaRefetch,
}) => {
  // ========== Óptica de legajo (medida compartida) ==========
  // La ruta es /legajo/[id]/medida/[medidaId]; params.id es el legajo desde el
  // que se está viendo la medida. Se usa para pedir al backend la etapa con
  // filtro ?legajo_id= (grupales + las de ESTE legajo) en medidas compartidas
  // (commit backend c29af1f). En medidas de un solo NNyA es inocuo.
  const routeParams = useParams()
  const legajoOpticaId = (() => {
    const raw = Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id
    const n = raw != null ? Number(raw) : NaN
    return Number.isNaN(n) ? undefined : n
  })()

  // ========== User Permissions ==========
  const { user } = useUser()
  const { isSuperuser, userLevel, isJZ, isEquipoLegal } = deriveWorkflowPermissions(user)

  // ========== V2 Etapa Filtering ==========
  const etapasOfThisType = React.useMemo(
    () => selectEtapasOfThisType(medidaApiData, workflowPhase),
    [medidaApiData, workflowPhase],
  )

  const etapaActualForThisTab = getEtapaForWorkflow(medidaApiData, workflowPhase, etapasOfThisType)

  const puedeIniciarNuevaEtapa = React.useMemo(
    () => computePuedeIniciarNuevaEtapa(medidaApiData, medidaData.tipo_medida, workflowPhase),
    [medidaApiData, medidaData.tipo_medida, workflowPhase],
  )

  // ========== V2 Mode Detection ==========
  /**
   * DISABLED: V2 mode uses a different UI that doesn't have interactive sections.
   * We want to keep using V1 mode (with AperturaSection, NotaAvalSection, etc.)
   * even when estado_especifico exists.
   *
   * V1 mode provides the full interactive workflow with sections for:
   * - Registro de Intervención (with modal)
   * - Nota de Aval (with form)
   * - Informe Jurídico (with uploads)
   * - Ratificación Judicial (with documents)
   */
  const useV2Mode = false // Always use V1 interactive workflow

  // ========== State Management ==========
  const {
    activeStep, setActiveStep,
    etapaDetail, setEtapaDetail,
    notaAval, setNotaAval,
    informeJuridico, setInformeJuridico,
    ratificacion, setRatificacion,
    isLoadingWorkflowData, setIsLoadingWorkflowData,
    estadosCatalog,
    isLoadingEstados,
    iniciarEtapaDialogOpen, setIniciarEtapaDialogOpen,
    isCreatingEtapa, setIsCreatingEtapa,
    createEtapaError, setCreateEtapaError,
    workflowRefreshKey,
    selectedEtapaId, setSelectedEtapaId,
    refreshWorkflowData,
  } = useWorkflowState(workflowPhase, onMedidaRefetch)

  /**
   * CRITICAL FIX: Use estado from the SPECIFIC etapa being viewed, not the current medida estado
   *
   * Previously: Used medidaData.estado (always the current active etapa's estado)
   * Now: Use etapaDetail.etapa.estado_actual?.codigo (V2 API response)
   * Fallback: etapaActualForThisTab?.estado (legacy V1 field)
   *
   * This ensures:
   * - Apertura tab shows Apertura's estado (even if it's no longer active)
   * - Innovación tab shows Innovación's estado
   * - Each tab has independent workflow progress
   * - Works with both V2 (estado_actual.codigo) and V1 (estado) API responses
   */
  const estadoActual = etapaDetail?.etapa.estado_actual?.codigo
    || etapaActualForThisTab?.estado
    || medidaData.estado
    || ""


  // Prepare data for AperturaSection
  const aperturaData = {
    fecha: medidaData.fecha_apertura || "",
    estado: estadoActual,
    equipo: "", // TODO: Get from medidaData if available
  }

  // ========== Fetch Etapa Detail Data on Mount ==========
  /**
   * NEW APPROACH: Fetch etapa detail with ALL documents in a single API call
   * Benefits:
   * - Single API call vs 3-4 separate calls
   * - Documents properly filtered by etapa (no cross-contamination)
   * - Better performance and consistency
   */
  useEffect(() => {
    const fetchEtapaDetail = async () => {
      await loadEtapaDetail({
        medidaId: medidaData.id,
        workflowPhase,
        selectedEtapaId,
        legajoOpticaId,
        setEtapaDetail,
        setNotaAval,
        setInformeJuridico,
        setRatificacion,
        setIsLoadingWorkflowData,
      })
    }

    fetchEtapaDetail()
  }, [medidaData.id, workflowPhase, workflowRefreshKey, selectedEtapaId, legajoOpticaId])

  // ========== Step Completion Logic ==========
  // Step 1: Intervención completed when estado is PENDIENTE_NOTA_AVAL or beyond
  const step1Completed = isIntervencionCompleted(estadoActual)

  // Step 2: Nota de Aval completed when estado is PENDIENTE_INFORME_JURIDICO or beyond
  // OR when nota exists with decision
  const step2Completed = isNotaAvalCompleted(
    notaAval !== null,
    notaAval?.decision !== null && notaAval?.decision !== undefined,
    estadoActual
  )

  // Step 3: Informe Jurídico completed when estado is PENDIENTE_RATIFICACION_JUDICIAL or beyond
  // OR when informe exists (for backwards compatibility)
  const step3Completed = isInformeJuridicoCompleted(informeJuridico, estadoActual)

  // Step 4: Ratificación completed when estado is RATIFICADA/VIGENTE/CERRADA
  // OR when ratificacion exists with adjuntos (PDF)
  const step4Completed = isRatificacionCompleted(
    ratificacion !== null,
    ratificacion?.adjuntos !== undefined && ratificacion?.adjuntos.length > 0,
    estadoActual
  )

  // MPI only has 3 steps (no Ratificación Judicial)
  // MPE and MPJ have 4 steps
  const isMPI = medidaData.tipo_medida === "MPI"
  const totalSteps = isMPI ? 3 : 4

  // MPI specific completion logic
  const mpiStep2Completed = step1Completed // Follow-up is accessible once approved
  const mpiStep3Completed = estadoActual === "CERRADA" || estadoActual === "INFORME_DE_CIERRE_REDACTADO"

  const completedSteps = isMPI
    ? [step1Completed, mpiStep2Completed, mpiStep3Completed]
    : [step1Completed, step2Completed, step3Completed, step4Completed]

  // ========== Progress Calculation ==========
  // Calculate progress based on actual data
  const step1Progress = step1Completed ? 100 : estadoActual === "ENVIADO" ? 70 : 30

  const step2Progress = step2Completed
    ? 100
    : notaAval
      ? (notaAval.decision ? 70 : 30)
      : 0

  const step3Progress = step3Completed ? 100 : informeJuridico ? 50 : 0

  const step4Progress = step4Completed
    ? 100
    : ratificacion
      ? (ratificacion.adjuntos && ratificacion.adjuntos.length > 0 ? 70 : 30)
      : 0

  // ========== Step Definitions ==========
  const steps = buildWorkflowSteps({
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
  })

  // ========== Auto-navigate to first incomplete step on mount ==========
  useEffect(() => {
    const firstIncomplete = completedSteps.findIndex((completed) => !completed)
    if (firstIncomplete !== -1 && firstIncomplete !== activeStep) {
      setActiveStep(firstIncomplete)
    }
  }, []) // Only run on mount

  // ========== Etapa Creation Handlers ==========
  const handleIniciarEtapa = () => {
    setCreateEtapaError(null)
    setIniciarEtapaDialogOpen(true)
  }

  // ========== Granularidad (legajos_alcance) ==========
  // El selector solo aparece cuando la medida tiene legajos adicionales (SAC compartido).
  // medidaApiData viene tipado como interfaz local pero en runtime trae `legajo` y
  // `legajos_adicionales` desde el response de useMedidaDetail (legajo-mesa types).
  const medidaApiAny = medidaApiData as any
  const legajoPrimarioForDialog = medidaApiAny?.legajo
    ? {
        id: medidaApiAny.legajo.id as number,
        numero: medidaApiAny.legajo.numero as string,
        nnya: {
          nombre: medidaApiAny.legajo.nnya?.nombre ?? "",
          apellido: medidaApiAny.legajo.nnya?.apellido ?? "",
        },
      }
    : undefined
  const legajosAdicionalesForDialog = (medidaApiAny?.legajos_adicionales ?? []) as any[]

  const handleConfirmIniciarEtapa = async (observaciones?: string, legajosAlcance?: number[]) => {
    if (!workflowPhase) return

    try {
      setIsCreatingEtapa(true)
      setCreateEtapaError(null)

      const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)

      logger.log(`[UnifiedWorkflowTab] Creating new etapa ${tipoEtapa} for medida ${medidaData.id}`)

      await createEtapa(medidaData.id, {
        tipo_etapa: tipoEtapa,
        observaciones,
        // Cuando el dialog mandó scope (Array — incluso vacío para grupal explícito)
        // lo enviamos al backend. Si no hay legajos adicionales el dialog manda
        // undefined y omitimos el campo.
        ...(legajosAlcance !== undefined ? { legajos_alcance: legajosAlcance } : {}),
      })

      logger.log('[UnifiedWorkflowTab] Etapa created successfully, reloading page...')

      // Refresh page to load new etapa data
      window.location.reload()
    } catch (error: any) {
      logger.error('[UnifiedWorkflowTab] Error creating etapa:', error)
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message ||
        'Error al crear la etapa'
      setCreateEtapaError(errorMessage)
    } finally {
      setIsCreatingEtapa(false)
    }
  }

  // ========== Render ==========

  // Loading state
  if (isLoadingEstados || isLoadingWorkflowData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // No etapa found for this workflow phase
  if (medidaApiData && !etapaActualForThisTab && workflowPhase) {
    return (
      <EtapaNotFoundView
        workflowPhase={workflowPhase}
        puedeIniciarNuevaEtapa={puedeIniciarNuevaEtapa}
        createEtapaError={createEtapaError}
        isCreatingEtapa={isCreatingEtapa}
        iniciarEtapaDialogOpen={iniciarEtapaDialogOpen}
        onIniciarEtapa={handleIniciarEtapa}
        onCloseDialog={() => {
          setIniciarEtapaDialogOpen(false)
          setCreateEtapaError(null)
        }}
        onConfirmIniciarEtapa={handleConfirmIniciarEtapa}
        legajoPrimarioForDialog={legajoPrimarioForDialog}
        legajosAdicionalesForDialog={legajosAdicionalesForDialog}
      />
    )
  }

  // ========== MPI Closure Section Detection ==========
  // Show InformeCierreSection when:
  // - MPI measure
  // - Cese phase (or Estados 3/4 detected)
  // - Estado 3 (PENDIENTE_DE_INFORME_DE_CIERRE) or Estado 4 (INFORME_DE_CIERRE_REDACTADO)
  const showInformeCierreSection =
    medidaData.tipo_medida === "MPI" &&
    medidaApiData &&
    etapaActualForThisTab &&
    workflowPhase === "cese"

  // Extract available estados from etapa's estado_especifico_detalle
  const availableEstadosFromEtapa: TEstadoEtapaMedida[] = estadosCatalog

  // ========== V2 Estados Catalog (REMOVED - no longer needed) ==========
  /**
   * OPTIMIZATION: We no longer need to fetch the estados catalog separately
   * because etapaDetail already includes the current estado_actual.
   *
   * The WorkflowStepper can use etapaDetail.etapa.estado_actual directly.
   * estadosCatalog is kept as an empty array for WorkflowStepper prop compatibility.
   */

  // V2 MODE: Use catalog-based EstadoStepper
  // Updated: Uses estados from etapa's estado_especifico_detalle instead of separate API call
  if (useV2Mode && workflowPhase && etapaActualForThisTab) {
    return (
      <WorkflowV2View
        workflowPhase={workflowPhase}
        etapaActualForThisTab={etapaActualForThisTab}
        medidaData={medidaData}
        medidaApiData={medidaApiData}
        availableEstadosFromEtapa={availableEstadosFromEtapa}
        showInformeCierreSection={Boolean(showInformeCierreSection)}
        legajoPrimarioForDialog={legajoPrimarioForDialog}
        legajosAdicionalesForDialog={legajosAdicionalesForDialog}
        isJZ={isJZ}
        refreshWorkflowData={refreshWorkflowData}
      />
    )
  }

  // GAP-08: Banner para iniciar otra etapa del mismo tipo cuando ya existe al menos una
  // y la transición está permitida por el backend.
  const tipoEtapaLabelForBanner = workflowPhase ? ETAPA_LABELS[workflowPhase] : undefined
  const showIniciarOtraEtapaBanner =
    puedeIniciarNuevaEtapa &&
    etapasOfThisType.length >= 1 &&
    workflowPhase !== "apertura"

  // GAP-08: historial selector — when there are multiple etapas of this type,
  // let the user pick which one's documents to view. Default = latest.
  const etapasHistorial = etapaDetail?.etapas_mismo_tipo ?? []
  const showEtapaSelector = etapasHistorial.length > 1

  // V1 MODE: Fallback to hardcoded steps (backward compatible)
  return (
    <>
      {showEtapaSelector && tipoEtapaLabelForBanner && (
        <EtapaHistorialSelector
          tipoEtapaLabelForBanner={tipoEtapaLabelForBanner}
          etapasHistorial={etapasHistorial}
          selectedEtapaId={selectedEtapaId}
          etapaDetail={etapaDetail}
          legajosAdicionalesForDialog={legajosAdicionalesForDialog}
          setSelectedEtapaId={setSelectedEtapaId}
        />
      )}

      {showIniciarOtraEtapaBanner && tipoEtapaLabelForBanner && (
        <IniciarOtraEtapaBanner
          tipoEtapaLabelForBanner={tipoEtapaLabelForBanner}
          etapasOfThisType={etapasOfThisType}
          isCreatingEtapa={isCreatingEtapa}
          onIniciarEtapa={handleIniciarEtapa}
        />
      )}

      {createEtapaError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCreateEtapaError(null)}>
          {createEtapaError}
        </Alert>
      )}

      {/* Granularidad: indicador grupal vs específica en V1 fallback. */}
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
        etapaLabel={workflowPhase ? ETAPA_LABELS[workflowPhase] : undefined}
      />

      <WorkflowStepper
        steps={steps}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        orientation="horizontal"
      />

      <IniciarEtapaDialog
        open={iniciarEtapaDialogOpen}
        onClose={() => {
          setIniciarEtapaDialogOpen(false)
          setCreateEtapaError(null)
        }}
        onConfirm={handleConfirmIniciarEtapa}
        tipoEtapa={workflowPhaseToTipoEtapa(workflowPhase ?? "innovacion")}
        isLoading={isCreatingEtapa}
        legajoPrimario={legajoPrimarioForDialog}
        legajosAdicionales={legajosAdicionalesForDialog}
      />
    </>
  )
}

export default UnifiedWorkflowTab
