"use client"

import { Checkbox, TableCell, TableHead, TableRow } from "@mui/material"
import type { ActividadFeatures } from "../features"

interface ActividadesTableHeadProps {
  features: ActividadFeatures
  isAllSelected: boolean
  isIndeterminate: boolean
  handleSelectAll: () => void
}

/** Cabecera de la tabla de actividades (columnas condicionadas por `features`). */
export const ActividadesTableHead = ({
  features,
  isAllSelected,
  isIndeterminate,
  handleSelectAll,
}: ActividadesTableHeadProps) => (
    <TableHead>
      <TableRow
        sx={{
          backgroundColor: "primary.main",
          "& .MuiTableCell-root": { position: "sticky", top: 0, zIndex: 1, backgroundColor: "primary.main" },
        }}
      >
        {features.showCheckbox && (
          <TableCell padding="checkbox" sx={{ backgroundColor: "primary.main" }}>
            <Checkbox
              inputProps={{ "aria-label": "Seleccionar todas las actividades de la página" }}
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={handleSelectAll}
              sx={{
                color: "white",
                "&.Mui-checked": { color: "white" },
                "&.MuiCheckbox-indeterminate": { color: "white" },
              }}
            />
          </TableCell>
        )}
        <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Tipo / Subactividad</TableCell>
        {features.showNnyaLegajo && (
          <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>NNyA / Legajo</TableCell>
        )}
        <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Equipo</TableCell>
        {features.showZonas && (
          <TableCell sx={{ display: { sm: "none", xl: "table-cell" }, fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Zonas</TableCell>
        )}
        <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Responsables</TableCell>
        {features.showFechaPlanificacion && (
          <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Fecha Plan.</TableCell>
        )}
        <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Estado</TableCell>
        <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Plazo</TableCell>
        <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem", textAlign: "center" }}>
          Acciones
        </TableCell>
      </TableRow>
    </TableHead>
)
