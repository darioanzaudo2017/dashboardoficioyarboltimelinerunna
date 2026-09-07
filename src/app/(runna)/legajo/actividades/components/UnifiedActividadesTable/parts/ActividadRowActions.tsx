"use client"

import { Box, IconButton, TableCell, Tooltip } from "@mui/material"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import EditIcon from "@mui/icons-material/Edit"
import FolderIcon from "@mui/icons-material/Folder"
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread"
import VisibilityIcon from "@mui/icons-material/Visibility"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import type { ActividadFeatures } from "../features"

interface ActividadRowActionsProps {
  actividad: TActividadPlanTrabajo
  features: ActividadFeatures
  isRead: boolean
  handleViewDetail: (actividad: TActividadPlanTrabajo) => void
  handleRequestAcuse: (actividad: TActividadPlanTrabajo) => void
  handleEdit: (actividad: TActividadPlanTrabajo) => void
  handleCancel: (actividad: TActividadPlanTrabajo) => void
  handleAssign: (actividad: TActividadPlanTrabajo) => void
  handleGoToLegajo: (actividad: TActividadPlanTrabajo) => void
}

/** Celda de acciones por fila: acuse/ver, editar, cancelar, asignar e ir al legajo. */
export const ActividadRowActions = ({
  actividad,
  features,
  isRead,
  handleViewDetail,
  handleRequestAcuse,
  handleEdit,
  handleCancel,
  handleAssign,
  handleGoToLegajo,
}: ActividadRowActionsProps) => (
  <TableCell sx={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
      {/* Acuse de Recibo / View - Sprint 2: Uses isRead from backend */}
      {features.showAcuseRecibo ? (
        isRead ? (
          <Tooltip title="Ver detalle (ya leída)">
            <IconButton
              size="small"
              onClick={() => handleViewDetail(actividad)}
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                color: "success.main",
                "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.2)", transform: "scale(1.1)" },
                transition: "all 0.2s",
              }}
            >
              <CheckCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Marcar como leída y ver detalle">
            <IconButton
              size="small"
              onClick={() => handleRequestAcuse(actividad)}
              sx={{
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.2)", transform: "scale(1.1)" },
                transition: "all 0.2s",
              }}
            >
              <MarkEmailUnreadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      ) : (
        <Tooltip title="Ver detalle">
          <IconButton
            size="small"
            onClick={() => handleViewDetail(actividad)}
            sx={{
              backgroundColor: "rgba(156, 39, 176, 0.1)",
              color: "primary.main",
              "&:hover": { backgroundColor: "rgba(156, 39, 176, 0.2)", transform: "scale(1.1)" },
              transition: "all 0.2s",
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Edit */}
      {features.showEdit && (
        <Tooltip title={actividad.estado !== "EN_PROGRESO" ? "Solo se puede editar una actividad en estado 'En Progreso'" : "Editar"}>
          <span>
            <IconButton
              size="small"
              onClick={() => handleEdit(actividad)}
              disabled={actividad.estado !== "EN_PROGRESO"}
              sx={{
                backgroundColor: "rgba(156, 39, 176, 0.1)",
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(156, 39, 176, 0.2)", transform: "scale(1.1)" },
                "&:disabled": { backgroundColor: "rgba(0, 0, 0, 0.05)", color: "rgba(0, 0, 0, 0.26)" },
                transition: "all 0.2s",
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {/* Cancel */}
      {features.showCancel && (
        <Tooltip title={actividad.estado === "COMPLETADA" || actividad.estado === "CANCELADA" ? "No se puede cancelar" : "Cancelar"}>
          <span>
            <IconButton
              size="small"
              onClick={() => handleCancel(actividad)}
              disabled={actividad.estado === "COMPLETADA" || actividad.estado === "CANCELADA"}
              sx={{
                color: "error.main",
                "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)", transform: "scale(1.1)" },
                "&:disabled": { backgroundColor: "rgba(0, 0, 0, 0.05)", color: "rgba(0, 0, 0, 0.26)" },
                transition: "all 0.2s",
              }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {/* Individual Assign */}
      {features.showIndividualAssign && (
        <Tooltip title="Asignar responsables">
          <IconButton
            size="small"
            onClick={() => handleAssign(actividad)}
            sx={{
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              color: "info.main",
              "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.2)", transform: "scale(1.1)" },
              transition: "all 0.2s",
            }}
          >
            <AssignmentIndIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Go to Legajo */}
      {features.showGoToLegajo && (
        <Tooltip title={actividad.legajo_info ? `Ir al legajo ${actividad.legajo_info.numero}` : "Ir al legajo"}>
          <span>
            <IconButton
              size="small"
              onClick={() => handleGoToLegajo(actividad)}
              disabled={!actividad.legajo_info || !actividad.medida_info}
              sx={{
                backgroundColor: "rgba(33, 150, 243, 0.1)",
                color: "info.main",
                "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.2)", transform: "scale(1.1)" },
                "&:disabled": { backgroundColor: "rgba(33, 150, 243, 0.05)" },
                transition: "all 0.2s",
              }}
            >
              <FolderIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  </TableCell>
)
