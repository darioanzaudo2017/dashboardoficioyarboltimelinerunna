"use client"

import type React from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material"
import FolderIcon from "@mui/icons-material/Folder"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import { getEstadoColor } from "../constants"
import type { ActividadFeatures } from "../features"

interface AcuseReciboDialogProps {
  features: ActividadFeatures
  pendingAcuseActividad: TActividadPlanTrabajo | null
  setPendingAcuseActividad: React.Dispatch<React.SetStateAction<TActividadPlanTrabajo | null>>
  handleConfirmAcuse: () => void
}

/** Confirmación de acuse de recibo antes de abrir una actividad sin leer. */
export const AcuseReciboDialog = ({
  features,
  pendingAcuseActividad,
  setPendingAcuseActividad,
  handleConfirmAcuse,
}: AcuseReciboDialogProps) => {
  if (!features.showAcuseRecibo) return null

  return (
    <Dialog
      open={!!pendingAcuseActividad}
      onClose={() => setPendingAcuseActividad(null)}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, borderTop: "4px solid #ff9800" } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ReceiptLongIcon color="warning" />
        Acuse de Recibo
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>Está a punto de acceder a la siguiente actividad:</DialogContentText>
        {pendingAcuseActividad && (
          <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {pendingAcuseActividad.tipo_actividad_info?.nombre || "Sin tipo"}
            </Typography>
            {pendingAcuseActividad.subactividad && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {pendingAcuseActividad.subactividad}
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
              {pendingAcuseActividad.legajo_info && (
                <Chip
                  size="small"
                  icon={<FolderIcon />}
                  label={`${pendingAcuseActividad.legajo_info.nnya_apellido}, ${pendingAcuseActividad.legajo_info.nnya_nombre}`}
                  variant="outlined"
                />
              )}
              <Chip
                size="small"
                label={pendingAcuseActividad.estado_display || pendingAcuseActividad.estado}
                sx={{
                  backgroundColor: getEstadoColor(pendingAcuseActividad.estado).backgroundColor,
                  color: getEstadoColor(pendingAcuseActividad.estado).color,
                  fontWeight: 500,
                }}
              />
            </Box>
          </Paper>
        )}
        <Alert severity="info" sx={{ mt: 2 }}>
          Al confirmar el acuse de recibo, quedará registrado que ha tomado conocimiento de esta actividad.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={() => setPendingAcuseActividad(null)} color="inherit" variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleConfirmAcuse} color="warning" variant="contained" startIcon={<CheckCircleOutlineIcon />}>
          Confirmar Acuse de Recibo
        </Button>
      </DialogActions>
    </Dialog>
  )
}
