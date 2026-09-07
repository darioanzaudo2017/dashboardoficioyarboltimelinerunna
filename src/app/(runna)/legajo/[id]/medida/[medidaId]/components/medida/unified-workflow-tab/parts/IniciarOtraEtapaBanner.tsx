import { Button, Alert } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"

interface IniciarOtraEtapaBannerProps {
  tipoEtapaLabelForBanner: string
  etapasOfThisType: unknown[]
  isCreatingEtapa: boolean
  onIniciarEtapa: () => void
}

/**
 * Banner GAP-08 para iniciar otra etapa del mismo tipo.
 * Movido tal cual desde `unified-workflow-tab.tsx` (líneas 936-958).
 */
export const IniciarOtraEtapaBanner = ({
  tipoEtapaLabelForBanner,
  etapasOfThisType,
  isCreatingEtapa,
  onIniciarEtapa,
}: IniciarOtraEtapaBannerProps) => (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              color="primary"
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onIniciarEtapa}
              disabled={isCreatingEtapa}
            >
              {isCreatingEtapa ? "Iniciando..." : `Iniciar nueva etapa de ${tipoEtapaLabelForBanner}`}
            </Button>
          }
        >
          Esta medida ya tiene{" "}
          <strong>
            {etapasOfThisType.length}{" "}
            {etapasOfThisType.length === 1 ? "etapa" : "etapas"} de {tipoEtapaLabelForBanner}
          </strong>
          . Podés registrar una nueva: la etapa actual se finalizará y empezará una nueva con sus propios documentos.
        </Alert>
)
