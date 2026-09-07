"use client"

import type React from "react"
import { Alert, Box, Button, IconButton, Paper, TablePagination, Tooltip, Typography } from "@mui/material"
import ClearIcon from "@mui/icons-material/Clear"
import RefreshIcon from "@mui/icons-material/Refresh"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import type { ActividadFeatures } from "../features"
import type { TableVariant } from "../types"

interface ActividadesContentProps {
  variant: TableVariant
  title: string | undefined
  features: ActividadFeatures
  hasActiveFilters: boolean
  handleClearFilters: () => void
  handleRefresh: () => void
  setPlanAccionModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  globalError: unknown
  actividades: TActividadPlanTrabajo[]
  filteredActividades: TActividadPlanTrabajo[]
  totalCount: number
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  rowsPerPage: number
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
  renderStatistics: () => React.ReactNode
  renderFilters: () => React.ReactNode
  renderBulkActionsToolbar: () => React.ReactNode
  renderTable: () => React.ReactNode
}

/** Cuerpo de la tabla: encabezado, estadísticas, filtros, tabla y paginación. */
export const ActividadesContent = ({
  variant,
  title,
  features,
  hasActiveFilters,
  handleClearFilters,
  handleRefresh,
  setPlanAccionModalOpen,
  globalError,
  actividades,
  filteredActividades,
  totalCount,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  renderStatistics,
  renderFilters,
  renderBulkActionsToolbar,
  renderTable,
}: ActividadesContentProps) => (
  <>
    {/* Header */}
    {variant !== "legajo" && (
      <Box sx={{ p: { xs: 1.5, sm: 3 }, pb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: "row", gap: 1.5, mb: 3 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component={variant === "global" ? "h1" : "h2"} variant="h5" sx={{ fontWeight: 600 }}>
              {title || (variant === "global" ? "Mis Actividades" : "Plan de trabajo")}
            </Typography>
            {variant === "global" && (
              <Typography variant="body2" color="text.secondary">
                Gestiona las actividades asignadas a ti o a tu equipo
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {hasActiveFilters && (
              <Tooltip title="Limpiar filtros">
                <IconButton onClick={handleClearFilters} size="small" aria-label="Limpiar filtros de actividades">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
            {features.showRefreshButton && (
              <Tooltip title="Actualizar">
                <IconButton onClick={handleRefresh} size="small" aria-label="Actualizar actividades">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            {features.showAddActivity && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setPlanAccionModalOpen(true)}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Agregar actividad
              </Button>
            )}
          </Box>
        </Box>

        {renderStatistics()}
        {renderFilters()}
      </Box>
    )}

    {/* Legajo variant content */}
    {variant === "legajo" && (
      <>
        {renderStatistics()}
        {renderFilters()}
      </>
    )}

    {/* Bulk Actions */}
    {variant !== "legajo" && renderBulkActionsToolbar()}
    {variant === "legajo" && renderBulkActionsToolbar()}

    {/* Error State */}
    {globalError && (
      <Alert severity="error" sx={{ mx: 3, mb: 2 }}>
        Error al cargar las actividades. Por favor intenta nuevamente.
      </Alert>
    )}

    {/* Table */}
    {variant === "legajo" ? (
      actividades.length > 0 && (
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
          {renderTable()}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredActividades.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
            sx={{
              "& .MuiTablePagination-toolbar": { px: { xs: 1, sm: 2 }, flexWrap: { xs: "wrap", sm: "nowrap" } },
              "& .MuiTablePagination-selectLabel": { display: { xs: "none", sm: "block" } },
              "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } },
              "& .MuiTablePagination-displayedRows": { ml: { xs: "auto", sm: 0 } },
            }}
          />
        </Paper>
      )
    ) : (
      <>
        {renderTable()}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={variant === "global" ? totalCount : filteredActividades.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          sx={{
            "& .MuiTablePagination-toolbar": { px: { xs: 1, sm: 2 }, flexWrap: { xs: "wrap", sm: "nowrap" } },
            "& .MuiTablePagination-selectLabel": { display: { xs: "none", sm: "block" } },
            "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } },
            "& .MuiTablePagination-displayedRows": { ml: { xs: "auto", sm: 0 } },
          }}
        />
      </>
    )}

    {/* Info adicional (legajo only) */}
    {variant === "legajo" && actividades.length > 0 && (
      <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          El plan de trabajo define las actividades y objetivos a cumplir para el seguimiento del legajo. Las actividades vencidas
          requieren atención inmediata. Puede seleccionar múltiples actividades para realizar acciones en lote.
        </Typography>
      </Box>
    )}
  </>
)
