"use client"

import React, { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Alert, Box, Button, Chip, CircularProgress, Typography } from "@mui/material"
import ListAltIcon from "@mui/icons-material/ListAlt"

import BaseModal from "@/components/shared/BaseModal"
import { UnifiedActividadesTable } from "@/app/(runna)/legajo/actividades/components/UnifiedActividadesTable"
import { useActividadesDeDemanda } from "../hooks/useActividadesDeDemanda"
import { contarSinReasignar } from "../utils/actividadesDeOficio"
import type { TActividadPlanTrabajo } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/types/actividades"

interface ActividadesDeOficioModalProps {
  demandaId: number | null
  open: boolean
  onClose: () => void
}

/**
 * Las actividades que generó una demanda de oficio, con la asignación masiva: es la misma vista que se abre al guardar
 * el oficio, para poder volver a ella desde la Mesa de Entradas.
 */
export const ActividadesDeOficioModal: React.FC<ActividadesDeOficioModalProps> = ({ demandaId, open, onClose }) => {
  const { data: actividades = [], isLoading, isError, refetch } = useActividadesDeDemanda(demandaId, open)
  const sinReasignar = contarSinReasignar(actividades)
  const queryClient = useQueryClient()

  // Tras una asignación o transferencia masiva la tabla devuelve la lista ya actualizada: se toma al instante y se confirma con el servidor.
  const handleActividadesUpdate = (actualizadas: TActividadPlanTrabajo[]) => {
    queryClient.setQueryData(["actividades-demanda", demandaId], actualizadas)
    refetch()
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ListAltIcon sx={{ color: "primary.main" }} />
          <span>Actividades de la demanda #{demandaId}</span>
        </Box>
      }
      width="95%"
      maxWidth={1200}
      minHeight={420}
      maxHeight="95vh"
      showCloseButton
      showFooterDivider
      actions={[{ label: "Cerrar", onClick: onClose, variant: "outlined", color: "inherit" }]}
    >
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Reintentar</Button>}>
          No se pudieron cargar las actividades de esta demanda.
        </Alert>
      )}

      {!isLoading && !isError && actividades.length === 0 && (
        <Alert severity="info">Esta demanda no tiene actividades en el plan de trabajo.</Alert>
      )}

      {!isLoading && !isError && actividades.length > 0 && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1 }}>
            <Chip label={`${actividades.length} actividades`} size="small" color="primary" variant="outlined" />
            {sinReasignar > 0 && (
              <Chip label={`${sinReasignar} sin reasignar`} size="small" color="warning" variant="outlined" />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Las actividades se crean a nombre de quien cargó el oficio. Seleccioná las que correspondan y usá
            &quot;Asignar Responsables&quot; para pasarlas al equipo y a las personas indicadas.
          </Typography>
          <UnifiedActividadesTable
            variant="legajo"
            actividades={actividades}
            onActividadesUpdate={handleActividadesUpdate}
            onRefresh={() => {
              refetch()
            }}
            showWrapper={false}
          />
        </>
      )}
    </BaseModal>
  )
}

interface ActividadesDeOficioAccesoProps {
  demandaId: number
}

/**
 * Aviso del detalle de una demanda de oficio: cuántas actividades generó y cuántas siguen sin reasignar, con el botón
 * para abrirlas. No se muestra si la demanda no generó actividades.
 */
export const ActividadesDeOficioAcceso: React.FC<ActividadesDeOficioAccesoProps> = ({ demandaId }) => {
  const [open, setOpen] = useState(false)
  const { data: actividades = [], isLoading } = useActividadesDeDemanda(demandaId)

  if (isLoading || actividades.length === 0) return null
  const sinReasignar = contarSinReasignar(actividades)

  return (
    <>
      <Alert
        severity={sinReasignar > 0 ? "warning" : "info"}
        icon={<ListAltIcon />}
        sx={{ mb: 3 }}
        action={
          <Button color="inherit" size="small" variant="outlined" onClick={() => setOpen(true)} sx={{ textTransform: "none", fontWeight: 600 }}>
            Ver y asignar actividades
          </Button>
        }
      >
        Esta demanda generó <strong>{actividades.length} actividades</strong> en el plan de trabajo
        {sinReasignar > 0 ? `; ${sinReasignar} todavía a nombre de quien cargó el oficio.` : "."}
      </Alert>
      <ActividadesDeOficioModal demandaId={demandaId} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
