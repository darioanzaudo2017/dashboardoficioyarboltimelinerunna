"use client"

import { Box, Chip, TableCell, Tooltip, Typography } from "@mui/material"
import FiberNewIcon from "@mui/icons-material/FiberNew"
import RepeatIcon from "@mui/icons-material/Repeat"
import TimelineIcon from "@mui/icons-material/Timeline"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import { EsGrupalChip } from "../../../../[id]/medida/[medidaId]/components/medida/shared/EsGrupalChip"

interface ActividadTipoCellProps {
  actividad: TActividadPlanTrabajo
  isUnread: boolean
  legajosLabelMap: Record<number, string>
  hasMultipleLegajos: boolean
}

/** Celda principal: tipo/subtipo, descripción, oficio de origen y chips de estado. */
export const ActividadTipoCell = ({
  actividad,
  isUnread,
  legajosLabelMap,
  hasMultipleLegajos,
}: ActividadTipoCellProps) => (
  <TableCell>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={500}>
          {actividad.tipo_actividad_info?.nombre || "Sin tipo"}
        </Typography>
        {actividad.subtipo_actividad_info?.nombre && (
          <Typography variant="caption" color="text.secondary">
            {actividad.subtipo_actividad_info.nombre}
          </Typography>
        )}
        {actividad.descripcion && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontStyle: "italic" }}>
            {actividad.descripcion.length > 50 ? `${actividad.descripcion.substring(0, 50)}...` : actividad.descripcion}
          </Typography>
        )}
        {actividad.oficio_origen && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.75, flexWrap: "wrap" }}>
            <Tooltip
              title={[
                actividad.oficio_origen.categoria,
                actividad.oficio_origen.tipo,
              ].filter(Boolean).join(" · ") || "Oficio judicial"}
            >
              <Chip
                label={actividad.oficio_origen.tipo || "Oficio judicial"}
                size="small"
                variant="outlined"
                color="info"
                sx={{ maxWidth: 190, height: 20, fontSize: "0.65rem" }}
              />
            </Tooltip>
            <Chip
              label={actividad.oficio_origen.estado_respuesta === "CONTESTADO" ? "Oficio contestado" : "Oficio pendiente"}
              size="small"
              color={actividad.oficio_origen.estado_respuesta === "CONTESTADO" ? "success" : "warning"}
              sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600 }}
            />
          </Box>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-end" }}>
        {/* Sprint 2: Unread badge for global variant */}
        {isUnread && (
          <Chip
            icon={<FiberNewIcon sx={{ fontSize: 14 }} />}
            label="Nueva"
            size="small"
            color="primary"
            sx={{ fontWeight: 600, fontSize: "0.65rem", height: 20 }}
          />
        )}
        {actividad.esta_vencida && actividad.estado === "PENDIENTE" && (
          <Chip label="VENCIDA" size="small" color="error" sx={{ fontWeight: 600, fontSize: "0.65rem" }} />
        )}
        {actividad.es_borrador && (
          <Chip label="BORRADOR" size="small" variant="outlined" color="warning" sx={{ fontWeight: 500, fontSize: "0.65rem" }} />
        )}
        {/* Granularidad: alcance grupal vs específico (solo en medidas compartidas) */}
        <EsGrupalChip
          esGrupal={actividad.es_grupal}
          legajosAlcance={actividad.legajos_alcance}
          legajoLabels={legajosLabelMap}
          hasMultipleLegajos={hasMultipleLegajos}
        />
        {/* Recursive Activity Indicator - Sprint 3 */}
        {actividad.tipo_actividad_info?.es_recursiva && (
          <Tooltip
            title={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Actividad Recursiva
                </Typography>
                <Typography variant="caption">
                  Se crea automáticamente cada {actividad.tipo_actividad_info.periodo_recursion_dias} días
                </Typography>
                {actividad.origen === "AUTO_RECURSIVA" && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: "italic" }}>
                    Creada automáticamente por el sistema
                  </Typography>
                )}
              </Box>
            }
          >
            <Chip
              icon={<RepeatIcon sx={{ fontSize: 14 }} />}
              label={actividad.origen === "AUTO_RECURSIVA" ? "AUTO" : `${actividad.tipo_actividad_info.periodo_recursion_dias}d`}
              size="small"
              variant="outlined"
              color="secondary"
              sx={{
                fontSize: "0.65rem",
                height: 20,
                backgroundColor: actividad.origen === "AUTO_RECURSIVA" ? "rgba(156, 39, 176, 0.1)" : "transparent",
                "& .MuiChip-icon": { color: "inherit" }
              }}
            />
          </Tooltip>
        )}
        {actividad.adjuntos && actividad.adjuntos.length > 0 && (
          <Tooltip title={`${actividad.adjuntos.length} archivos`}>
            <Chip
              icon={<TimelineIcon fontSize="small" />}
              label={actividad.adjuntos.length}
              size="small"
              variant="outlined"
              color="info"
              sx={{ fontSize: "0.65rem", height: 18 }}
            />
          </Tooltip>
        )}
      </Box>
    </Box>
  </TableCell>
)
