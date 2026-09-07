"use client"

import type React from "react"
import { Box, Chip, Pagination, Skeleton, Stack, Tooltip, Typography } from "@mui/material"
import { AttachFile, Warning } from "@mui/icons-material"
import type { GridPaginationModel } from "@mui/x-data-grid"
import { rgba } from "@/theme/colors"
import { StatusChip } from "../StatusChip"
import { getStatusColor } from "../utils"
import type { DemandaRow } from "../utils"

interface DemandaCardsListProps {
  rows: DemandaRow[]
  isLoading: boolean
  selectedDemandaId: number | null
  onSelectDemanda: (row: DemandaRow) => void
  totalCount: number
  paginationModel: GridPaginationModel
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>
}

/** Panel izquierdo del modo lista: tarjetas de demandas + paginación compacta. */
export const DemandaCardsList = ({
  rows,
  isLoading,
  selectedDemandaId,
  onSelectDemanda,
  totalCount,
  paginationModel,
  setPaginationModel,
}: DemandaCardsListProps) => (
  <Box
    sx={{
      width: { xs: "100%", md: 420 },
      flexShrink: 0,
      borderRight: { xs: "none", md: "1px solid #e0e0e0" },
      display: "flex",
      flexDirection: "column",
      bgcolor: "#fafafa",
    }}
  >
    <Box sx={{ flex: 1, overflowY: "auto" }}>
      {isLoading && rows.length === 0 ? (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No se encontraron demandas con los filtros actuales.
          </Typography>
        </Box>
      ) : (
        rows.map((row) => {
          const isSelected = selectedDemandaId === row.id
          const accent = getStatusColor(row.estado_demanda)
          return (
            <Box
              key={row.id}
              onClick={() => onSelectDemanda(row)}
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: "1px solid #eee",
                borderLeft: `4px solid ${accent}`,
                cursor: "pointer",
                bgcolor: isSelected
                  ? rgba.primaryLight(0.12)
                  : row.recibido
                    ? "#fff"
                    : "#fff",
                transition: "background-color 0.15s",
                "&:hover": { bgcolor: rgba.primaryLight(0.06) },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: row.recibido ? 400 : 700,
                    flex: 1,
                    minWidth: 0,
                  }}
                  noWrap
                  title={row.nombre}
                >
                  {row.nombre}
                </Typography>
                {row.calificacion === "URGENTE" && (
                  <Tooltip title="Urgente">
                    <Warning color="error" fontSize="small" />
                  </Tooltip>
                )}
                <Typography variant="caption" color="text.secondary">
                  #{row.id}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                <StatusChip status={row.estado_demanda} />
                {row.hasLegajo && (
                  <Tooltip title={`Legajo: ${row.legajoNumero}`}>
                    <Chip
                      label="📋"
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: "0.7rem", "& .MuiChip-label": { px: 0.5 } }}
                    />
                  </Tooltip>
                )}
                {row.isFromLinkedLegajo && (
                  <Chip
                    label="Vinculado"
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.65rem", "& .MuiChip-label": { px: 0.75 } }}
                  />
                )}
                {Array.isArray(row.adjuntos) && row.adjuntos.length > 0 && (
                  <Tooltip title={`${row.adjuntos.length} adjuntos`}>
                    <Chip
                      icon={<AttachFile sx={{ fontSize: "0.85rem !important" }} />}
                      label={row.adjuntos.length}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  </Tooltip>
                )}
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
                noWrap
                title={`${row.zonaEquipo} · ${row.localidad} · ${row.ultimaActualizacion}`}
              >
                {row.zonaEquipo} · {row.localidad} · {row.ultimaActualizacion}
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
        borderTop: "1px solid #e0e0e0",
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
