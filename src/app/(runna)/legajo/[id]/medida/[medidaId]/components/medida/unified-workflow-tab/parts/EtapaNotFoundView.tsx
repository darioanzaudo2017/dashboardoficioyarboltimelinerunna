import { Box, Button, Alert } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import IniciarEtapaDialog from "../../../dialogs/iniciar-etapa-dialog"
import { workflowPhaseToTipoEtapa } from "../../../../utils/workflow-tipo-mapper"
import type { WorkflowPhase } from "../../../../types/workflow"
import { ETAPA_LABELS } from "../constants"

interface EtapaNotFoundViewProps {
  workflowPhase: WorkflowPhase
  puedeIniciarNuevaEtapa: boolean
  createEtapaError: string | null
  isCreatingEtapa: boolean
  iniciarEtapaDialogOpen: boolean
  onIniciarEtapa: () => void
  onCloseDialog: () => void
  onConfirmIniciarEtapa: (observaciones?: string, legajosAlcance?: number[]) => void
  legajoPrimarioForDialog: any
  legajosAdicionalesForDialog: any[]
}

/**
 * Vista de "no existe una etapa de esta fase".
 * Movida tal cual desde `unified-workflow-tab.tsx` (líneas 716-779).
 */
export const EtapaNotFoundView = ({
  workflowPhase,
  puedeIniciarNuevaEtapa,
  createEtapaError,
  isCreatingEtapa,
  iniciarEtapaDialogOpen,
  onIniciarEtapa,
  onCloseDialog,
  onConfirmIniciarEtapa,
  legajoPrimarioForDialog,
  legajosAdicionalesForDialog,
}: EtapaNotFoundViewProps) => {
    const tipoEtapaLabel = ETAPA_LABELS[workflowPhase]

    const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)

    return (
      <>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Alert severity="info" sx={{ width: '100%', maxWidth: 600 }}>
            No existe una etapa de <strong>{tipoEtapaLabel}</strong> para esta medida.
            {workflowPhase !== 'apertura' && puedeIniciarNuevaEtapa && (
              <>
                {' '}
                Para comenzar a trabajar en esta etapa, debe iniciarla primero.
              </>
            )}
          </Alert>

          {createEtapaError && (
            <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
              {createEtapaError}
            </Alert>
          )}

          {workflowPhase !== 'apertura' && puedeIniciarNuevaEtapa && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onIniciarEtapa}
              disabled={isCreatingEtapa}
            >
              Iniciar Etapa de {tipoEtapaLabel}
            </Button>
          )}

          {workflowPhase !== 'apertura' && !puedeIniciarNuevaEtapa && (
            <Alert severity="warning" sx={{ width: '100%', maxWidth: 600 }}>
              Esta etapa todavía no puede iniciarse desde el estado actual de la medida.
              Completá o finalizá la etapa en curso antes de iniciar una de {tipoEtapaLabel}.
            </Alert>
          )}
        </Box>

        <IniciarEtapaDialog
          open={iniciarEtapaDialogOpen}
          onClose={onCloseDialog}
          onConfirm={onConfirmIniciarEtapa}
          tipoEtapa={tipoEtapa}
          isLoading={isCreatingEtapa}
          legajoPrimario={legajoPrimarioForDialog}
          legajosAdicionales={legajosAdicionalesForDialog}
        />
      </>
    )
}
