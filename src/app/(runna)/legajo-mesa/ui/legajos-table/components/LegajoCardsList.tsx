"use client"

import type React from "react"
import { Box, Chip, Pagination, Skeleton, Stack, Tooltip, Typography, alpha } from "@mui/material"
import { PriorityHigh } from "@mui/icons-material"
import { AlertasChip } from "../../../components/indicadores-chips"
import type { GridPaginationModel } from "@mui/x-data-grid"
import type { LegajoRow } from "../utils"

interface LegajoCardsListProps {
  rows: LegajoRow[]
  isLoading: boolean
  selectedLegajoId: number | null
  handleOpenModal: (legajoId: number) => void
  totalCount: number
  paginationModel: GridPaginationModel
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>
}

/** Panel izquierdo del modo lista: tarjetas de legajos + paginación compacta. */
export const LegajoCardsList = ({
  rows,
  isLoading,
  selectedLegajoId,
  handleOpenModal,
  totalCount,
  paginationModel,
  setPaginationModel,
}: LegajoCardsListProps) => (
  <Box
    sx={{
      width: { xs: "100%", md: 420 },
      flexShrink: 0,
      borderRight: { xs: "none", md: "1px solid #e2e8f0" },
      display: "flex",
      flexDirection: "column",
      bgcolor: "#fafbfc",
    }}
  >
    <Box sx={{ flex: 1, overflowY: "auto" }}>
      {isLoading && rows.length === 0 ? (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={84} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No se encontraron legajos con los filtros actuales.
          </Typography>
        </Box>
      ) : (
        rows.map((row) => {
          const isSelected = selectedLegajoId === row.id
          const accent = row.prioridad === "ALTA"
            ? "#dc2626"
            : row.prioridad === "MEDIA"
              ? "#ef6c00"
              : row.prioridad === "BAJA"
                ? "#2e7d32"
                : "#cbd5e1"
          return (
            <Box
              key={row.id}
              onClick={() => handleOpenModal(row.id)}
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: "1px solid #eef2f6",
                borderLeft: `4px solid ${accent}`,
                cursor: "pointer",
                bgcolor: isSelected ? alpha("#1976d2", 0.08) : "#fff",
                transition: "background-color 0.15s",
                "&:hover": { bgcolor: isSelected ? alpha("#1976d2", 0.12) : "#f8fafc" },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#1e293b", flex: 1, minWidth: 0 }}
                  noWrap
                  title={row.nombre}
                >
                  {row.nombre}
                </Typography>
                {row.prioridad === "ALTA" && (
                  <Tooltip title="Alta prioridad">
                    <PriorityHigh sx={{ fontSize: 16, color: "#dc2626" }} />
                  </Tooltip>
                )}
                <Typography variant="caption" sx={{ color: "#1e40af", fontWeight: 500 }}>
                  {row.numero_legajo}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                <AlertasChip
                  alertas={row.indicadores?.alertas || []}
                  virtualAlerts={[]}
                />
                {row.medidas_activas_count > 0 && (
                  <Tooltip title={`${row.medidas_activas_count} medidas activas`}>
                    <Chip
                      label={`M·${row.medidas_activas_count}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: alpha("#3b82f6", 0.1),
                        color: "#2563eb",
                        border: "1px solid #93c5fd",
                      }}
                    />
                  </Tooltip>
                )}
                {row.actividades_activas_count > 0 && (
                  <Tooltip title={`${row.actividades_activas_count} actividades activas`}>
                    <Chip
                      label={`A·${row.actividades_activas_count}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: alpha("#8b5cf6", 0.1),
                        color: "#7c3aed",
                        border: "1px solid #c4b5fd",
                      }}
                    />
                  </Tooltip>
                )}
                {row.oficios_count > 0 && (
                  <Tooltip title={`${row.oficios_count} oficios`}>
                    <Chip
                      label={`O·${row.oficios_count}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: alpha("#0ea5e9", 0.1),
                        color: "#0284c7",
                        border: "1px solid #7dd3fc",
                      }}
                    />
                  </Tooltip>
                )}
              </Stack>

              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: "block", color: "#64748b" }}
                noWrap
                title={`${row.zona || "-"} · ${row.equipo_trabajo || "-"} · ${row.ultimaActualizacion}`}
              >
                {row.zona || "-"} · {row.equipo_trabajo || "-"} · {row.ultimaActualizacion}
              </Typography>
            </Box>
          )
        })
      )}
    </Box>

    {/* Compact pagination footer */}
    <Box
      sx={{
        px: 2,
        py: 1,
        borderTop: "1px solid #e2e8f0",
        bgcolor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {totalCount > 0
          ? `${paginationModel.page * paginationModel.pageSize + 1}–${Math.min(
              (paginationModel.page + 1) * paginationModel.pageSize,
              totalCount,
            )} de ${totalCount}`
          : "0 resultados"}
      </Typography>
      <Pagination
        size="small"
        count={Math.max(1, Math.ceil(totalCount / paginationModel.pageSize))}
        page={paginationModel.page + 1}
        onChange={(_, p) => setPaginationModel((prev) => ({ ...prev, page: p - 1 }))}
        siblingCount={0}
        boundaryCount={1}
      />
    </Box>
  </Box>
)
