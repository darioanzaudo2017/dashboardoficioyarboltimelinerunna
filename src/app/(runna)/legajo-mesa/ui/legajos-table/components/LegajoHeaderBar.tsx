"use client"

import type React from "react"
import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { ViewListRounded, TableRowsRounded } from "@mui/icons-material"
import type { GridPaginationModel } from "@mui/x-data-grid"
import { gradients } from "@/theme/colors"
import LegajoButtons from "../../legajos-buttons"
import LegajoFilters, { type LegajoFiltersState } from "../../legajos-filters"
import LegajoSearchBar from "../../../components/search/LegajoSearchBar"
import type { LegajoViewMode } from "../constants"

interface LegajoHeaderBarProps {
  viewMode: LegajoViewMode
  handleViewModeChange: (event: React.MouseEvent<HTMLElement>, next: LegajoViewMode | null) => void
  handleSearch: (searchTerm: string) => void
  apiFilters: LegajoFiltersState & { search: string | null }
  isLoading: boolean
  loadLegajos: () => void
  setApiFilters: React.Dispatch<React.SetStateAction<LegajoFiltersState & { search: string | null }>>
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>
}

/** Encabezado: título, conmutador Lista/Tabla, búsqueda, alta y filtros. */
export const LegajoHeaderBar = ({
  viewMode,
  handleViewModeChange,
  handleSearch,
  apiFilters,
  isLoading,
  loadLegajos,
  setApiFilters,
  setPaginationModel,
}: LegajoHeaderBarProps) => (
  <Box sx={{ p: { xs: 1.5, md: 2.5 }, borderBottom: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
    <Box
      sx={{
        mb: 2,
        display: "flex",
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.5,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.125rem", md: "1.5rem" },
          background: gradients.title,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.5px",
        }}
      >
        Bandeja de Legajos
      </Typography>

      <ToggleButtonGroup
        size="small"
        exclusive
        value={viewMode}
        onChange={handleViewModeChange}
        aria-label="Modo de vista"
        sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
      >
        <ToggleButton value="list" aria-label="Vista lista" sx={{ textTransform: "none", px: 1.25 }}>
          <ViewListRounded fontSize="small" sx={{ mr: 0.5 }} />
          Lista
        </ToggleButton>
        <ToggleButton value="tabla" aria-label="Vista tabla" sx={{ textTransform: "none", px: 1.25 }}>
          <TableRowsRounded fontSize="small" sx={{ mr: 0.5 }} />
          Tabla
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>

    <Box sx={{ mb: 2 }}>
      <LegajoSearchBar onSearch={handleSearch} initialValue={apiFilters.search || ""} />
    </Box>
    <div className="flex flex-wrap gap-2 sm:gap-4 relative z-10">
      <LegajoButtons isLoading={isLoading} handleNuevoRegistro={() => { }} onLegajoCreated={() => loadLegajos()} />
      <LegajoFilters onFilterChange={(newFilters) => { setApiFilters((prev) => ({ ...prev, ...newFilters })); setPaginationModel((prev) => ({ ...prev, page: 0 })) }} />
    </div>
  </Box>
)
