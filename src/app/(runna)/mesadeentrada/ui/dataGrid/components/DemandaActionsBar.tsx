"use client"

import { Box, Button, IconButton } from "@mui/material"
import { Refresh, DownloadRounded } from "@mui/icons-material"
import Buttons from "@/components/Buttons"
import { institutionalColors, rgba } from "@/theme/colors"
import type { DemandaFilterState } from "../types"
import { DemandaResponsableFilter } from "./DemandaResponsableFilter"

interface DemandaActionsBarProps {
  isLoading: boolean
  onNuevoRegistro: () => void
  onFilterChange: (filters: DemandaFilterState) => void
  /** `mis_demandas=true` activo. */
  misDemandas: boolean
  /** `responsable=<user_id>` activo, o null. */
  responsable: number | null
  /** Solo jefes zonales, directores y admins eligen a otra persona. */
  canFilterByResponsable: boolean
  onResponsableFilterChange: (next: { mis_demandas: boolean; responsable: number | null }) => void
  onExportXlsx: () => void
  onRefetch: () => void
}

/** Barra 2: nuevo registro + filtros + responsable + exportar a Excel + refrescar. */
export const DemandaActionsBar = ({
  isLoading,
  onNuevoRegistro,
  onFilterChange,
  misDemandas,
  responsable,
  canFilterByResponsable,
  onResponsableFilterChange,
  onExportXlsx,
  onRefetch,
}: DemandaActionsBarProps) => (
  <Box
    sx={{
      px: { xs: 2, md: 3 },
      py: { xs: 1, md: 1.5 },
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: { xs: 1, md: 1.5 },
      borderBottom: "1px solid #e0e0e0",
      bgcolor: "#fafafa",
    }}
  >
    <Buttons
      isLoading={isLoading}
      handleNuevoRegistro={onNuevoRegistro}
      onFilterChange={onFilterChange}
    />

    {/* Queda fuera de `Buttons` a propósito: ese componente se reemplaza por
        skeletons en cada refetch, y el filtro tiene que seguir visible -y
        apagable- mientras la bandeja recarga. */}
    <DemandaResponsableFilter
      misDemandas={misDemandas}
      responsable={responsable}
      canFilterByResponsable={canFilterByResponsable}
      onChange={onResponsableFilterChange}
    />

    <Button
      size="small"
      startIcon={<DownloadRounded />}
      onClick={onExportXlsx}
      sx={{
        px: 2,
        py: 0.75,
        borderRadius: 1.5,
        color: institutionalColors.azulPrincipal,
        border: `1px solid ${rgba.primary(0.15)}`,
        textTransform: "none",
        fontWeight: 500,
        "&:hover": {
          backgroundColor: rgba.primaryLight(0.04),
          borderColor: institutionalColors.azulClaro,
        },
      }}
    >
      Exportar Excel
    </Button>

    <IconButton
      size="small"
      onClick={() => onRefetch()}
      aria-label="Actualizar Mesa de Entradas"
      sx={{
        color: institutionalColors.azulPrincipal,
        border: `1px solid ${rgba.primary(0.15)}`,
        borderRadius: 1.5,
        padding: 1,
        "&:hover": {
          backgroundColor: rgba.primaryLight(0.04),
          borderColor: institutionalColors.azulClaro,
        },
      }}
    >
      <Refresh fontSize="small" />
    </IconButton>
  </Box>
)
