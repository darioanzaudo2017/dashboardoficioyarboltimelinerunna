"use client"

import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material"
import FilterListIcon from "@mui/icons-material/FilterList"
import { ActividadesMobileCards } from "./ActividadesMobileCards"
import { ActividadesTableHead } from "./ActividadesTableHead"
import { ActividadTableRow } from "./ActividadTableRow"
import type { ActividadesTableProps } from "./tableProps"

/** Tabla de actividades: tarjetas en mobile (global) + tabla de escritorio. */
export const ActividadesTable = (props: ActividadesTableProps) => {
  const {
    variant,
    paginatedActividades,
    features,
    hasActiveFilters,
    isAllSelected,
    isIndeterminate,
    handleClearFilters,
    handleSelectAll,
  } = props

  return (
    <>
      {variant === "global" && <ActividadesMobileCards {...props} />}
      <TableContainer sx={{ display: { xs: variant === "global" ? "none" : "block", sm: "block" } }}>
      <Table size="small" sx={{ "& .MuiTableRow-root:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" } }}>
        <ActividadesTableHead
          features={features}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          handleSelectAll={handleSelectAll}
        />
        <TableBody>
          {paginatedActividades.length === 0 ? (
<TableRow>
  <TableCell colSpan={features.showNnyaLegajo ? (features.showZonas ? 10 : 9) : features.showFechaPlanificacion ? 8 : 7} align="center">
    <Box sx={{ py: 8, textAlign: "center" }}>
      <FilterListIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {hasActiveFilters
          ? "No se encontraron actividades con los filtros aplicados"
          : variant === "global"
            ? "No tienes actividades asignadas"
            : "No hay actividades en el plan de trabajo"}
      </Typography>
      {hasActiveFilters && (
        <Chip label="Limpiar filtros" onClick={handleClearFilters} color="primary" variant="outlined" sx={{ mt: 2 }} />
      )}
    </Box>
  </TableCell>
</TableRow>
          ) : (
            paginatedActividades.map((actividad) => (
              <ActividadTableRow key={actividad.id} actividad={actividad} {...props} />
            ))
          )}
        </TableBody>
      </Table>
      </TableContainer>
    </>
  )
}
