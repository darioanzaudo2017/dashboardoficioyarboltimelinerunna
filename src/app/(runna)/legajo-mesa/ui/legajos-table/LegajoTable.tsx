"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Paper, Box, useMediaQuery, useTheme } from "@mui/material"
import { DataGrid, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import AsignarLegajoModal from "../../components/asignar-legajo-modal"
import { updateLegajoPrioridad } from "../../api/legajos-api-service"
import {
  shouldHighlightLegajo as shouldHighlightLegajoUtil,
  UserPermissions,
} from "@/utils/notification-utils"
import type { PaginatedLegajosResponse } from "../../types/legajo-api"
import { exportLegajosToExcel } from "../legajos-service"
import ActiveFiltersBar from "../../components/search/ActiveFiltersBar"
import { useUserPermissions } from "../../hooks/useUserPermissions"
import { useFilterOptions } from "../../hooks/useFilterOptions"
import { useApiQuery } from "@/hooks/useApiQuery"

import { CustomToolbar } from "./toolbar"
import { buildLegajoColumns } from "./columns"
import { legajoGridSx } from "./gridConfig"
import { buildLegajoQueryParams, mapLegajoToRow } from "./utils"
import { useLegajoFilters } from "./hooks/useLegajoFilters"
import { useLegajoViewMode } from "./hooks/useLegajoViewMode"
import { useGridScrollAffordance } from "./hooks/useGridScrollAffordance"
import { LegajoHeaderBar } from "./components/LegajoHeaderBar"
import { GridScrollButtons } from "./components/GridScrollButtons"
import { LegajoCardsList } from "./components/LegajoCardsList"
import { LegajoDetailPane, LegajoDetailDrawer, LegajoDetailModal } from "./components/LegajoDetailViews"
import { LegajoFilterSidebar } from "./components/LegajoFilterSidebar"
import { useLegajosConTareaPendiente } from "./hooks/useLegajosConTareaPendiente"


const LegajoTable: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"))
  const permissions = useUserPermissions()
  const filterOptions = useFilterOptions()
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [selectedLegajoId, setSelectedLegajoId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false)
  const [selectedLegajoIdForAssignment, setSelectedLegajoIdForAssignment] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [tareasPendientesActivo, setTareasPendientesActivo] = useState(false)

  const {
    apiFilters,
    setApiFilters,
    handleFilterChange,
    handleSearch,
    handleRemoveFilter,
    handleClearAllFilters,
  } = useLegajoFilters(setPaginationModel)

  const { viewMode, handleViewModeChange } = useLegajoViewMode()

  // Sync ?legajo=ID URL param -> selectedLegajoId on first mount.
  useEffect(() => {
    const fromUrl = searchParams.get("legajo")
    if (fromUrl) {
      const parsed = Number(fromUrl)
      if (!Number.isNaN(parsed)) setSelectedLegajoId(parsed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateUrlSelection = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id == null) params.delete("legajo")
    else params.set("legajo", String(id))
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : "?", { scroll: false })
  }


  // Build query params using useMemo - API uses 1-based pagination.
  // "Tareas propias pendientes" no tiene parámetro de backend: se resuelve
  // filtrando del lado del cliente, así que en ese modo se pide una página
  // grande (en vez de la página elegida en la UI) para filtrar sobre el total
  // real y no solo sobre los 10/25 legajos que hubiesen tocado en la página
  // actual del servidor.
  const queryParams = useMemo(
    () =>
      buildLegajoQueryParams(
        tareasPendientesActivo ? { page: 0, pageSize: 500 } : paginationModel,
        apiFilters,
        sortModel,
      ),
    [paginationModel.page, paginationModel.pageSize, apiFilters, sortModel, tareasPendientesActivo],
  )

  // Fetch legajos using TanStack Query
  const { data: legajosData, isLoading, refetch } = useApiQuery<PaginatedLegajosResponse>(
    "legajos/",
    queryParams
  )

  const totalCount = legajosData?.count || 0

  // Wrapper function for backward compatibility with existing callbacks
  const loadLegajos = () => {
    refetch()
  }

  const userPerms: UserPermissions = useMemo(
    () => ({
      isDirector: permissions.isDirector,
      isLegales: permissions.isLegales,
      isEquipoTecnico: permissions.isEquipoTecnico,
      isJefeZonal: permissions.isJefeZonal,
      isAdmin: permissions.isAdmin,
      userId: permissions.user?.id,
    }),
    [permissions],
  )

  /**
   * Determina si un legajo debe resaltarse basándose en el rol del usuario y el
   * estado actual de la etapa actual de sus medidas vigentes.
   */
  const shouldHighlightLegajo = (row: any): boolean => shouldHighlightLegajoUtil(row, userPerms)

  // "Tareas propias pendientes": mismo criterio que la campanita de notificaciones,
  // aplicado del lado del cliente (no hay parámetro de backend para esto).
  const { legajoIds: legajosConTareaPendiente, isLoading: isLoadingTareasPendientes } =
    useLegajosConTareaPendiente(userPerms, tareasPendientesActivo)

  const handlePrioridadChange = async (legajoId: number, newValue: string) => {
    setIsUpdating(true)
    try {
      const updatedLegajo = await updateLegajoPrioridad(legajoId, newValue as "ALTA" | "MEDIA" | "BAJA")
      const urgenciaToPrioridadMap: Record<number, "ALTA" | "MEDIA" | "BAJA"> = {
        1: "ALTA",
        2: "MEDIA",
        3: "BAJA",
      }
      const prioridadFromResponse = updatedLegajo.urgencia
        ? urgenciaToPrioridadMap[updatedLegajo.urgencia]
        : (newValue as "ALTA" | "MEDIA" | "BAJA")

      queryClient.setQueryData<PaginatedLegajosResponse>(["legajos/", queryParams], (oldData) => {
        if (!oldData) return oldData
        const updatedResults = oldData.results.map((legajo) =>
          legajo.id === legajoId
            ? { ...legajo, prioridad: prioridadFromResponse, urgencia: updatedLegajo.urgencia }
            : legajo
        )
        return { ...oldData, results: updatedResults }
      })
      toast.success("Prioridad actualizada con éxito")
    } catch (error) {
      toast.error("Error al actualizar la Prioridad")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleOpenModal = (legajoId: number) => {
    setSelectedLegajoId(legajoId)
    updateUrlSelection(legajoId)
    // Modal only opens in tabla mode; list mode shows detail in the side pane.
    if (viewMode === "tabla") setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedLegajoId(null)
    setIsModalOpen(false)
    updateUrlSelection(null)
  }

  const handleOpenAsignarModal = (legajoId: number) => {
    setSelectedLegajoIdForAssignment(legajoId)
    setIsAsignarModalOpen(true)
  }

  const handleCloseAsignarModal = () => {
    setSelectedLegajoIdForAssignment(null)
    setIsAsignarModalOpen(false)
  }

  const columns = useMemo(
    () =>
      buildLegajoColumns({
        isMobile,
        permissions,
        handlePrioridadChange,
        handleOpenModal,
        handleOpenAsignarModal,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobile, permissions],
  )

  const jefeZonalNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.jefesZonales.forEach((j) => { mapping[j.id] = j.nombre_completo || j.nombre || `ID: ${j.id}` })
    return mapping
  }, [filterOptions.jefesZonales])

  const directorNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.directores.forEach((d) => { mapping[d.id] = d.nombre_completo || d.nombre || `ID: ${d.id}` })
    return mapping
  }, [filterOptions.directores])

  const equipoTrabajoNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.equiposTrabajo.forEach((e) => { mapping[e.id] = e.nombre || e.codigo || `ID: ${e.id}` })
    return mapping
  }, [filterOptions.equiposTrabajo])

  const equipoCentroVidaNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.equiposCentroVida.forEach((e) => { mapping[e.id] = e.nombre || e.codigo || `ID: ${e.id}` })
    return mapping
  }, [filterOptions.equiposCentroVida])

  const rows = useMemo(() => {
    const mapped = legajosData?.results.map(mapLegajoToRow) || []
    if (!tareasPendientesActivo) return mapped
    return mapped.filter((row) => legajosConTareaPendiente.has(row.id))
  }, [legajosData, tareasPendientesActivo, legajosConTareaPendiente])

  // Con "tareas propias pendientes" activo, rows ya es la lista completa
  // (filtrada del lado del cliente sobre una página grande) — la paginación
  // pasa a ser local y el conteo mostrado debe reflejar eso, no el total
  // del servidor sin filtrar.
  const effectiveTotalCount = tareasPendientesActivo ? rows.length : totalCount

  // LegajoCardsList no auto-pagina: cuando el filtro es local hay que
  // recortarle la página nosotros (el DataGrid sí lo resuelve solo via
  // paginationMode="client").
  const cardsRows = useMemo(() => {
    if (!tareasPendientesActivo) return rows
    const start = paginationModel.page * paginationModel.pageSize
    return rows.slice(start, start + paginationModel.pageSize)
  }, [rows, tareasPendientesActivo, paginationModel])

  const handleExportXlsx = () => {
    exportLegajosToExcel(rows, { filters: apiFilters, totalCount: effectiveTotalCount })
    toast.success("Archivo Excel generado correctamente")
  }

  // Layout flags. List mode reuses the DataGrid for the "nothing selected" state on
  // desktop (denser scan view) and switches to a 420px sidebar of cards once a
  // legajo is opened. On mobile the cards list is always shown and detail is in a
  // Drawer, since DataGrid is unusable on small screens.
  const showTable = viewMode === "tabla" || (viewMode === "list" && !selectedLegajoId && !isMdDown)
  const showCardsList = viewMode === "list" && (isMdDown || selectedLegajoId !== null)

  const { gridContainerRef, canScrollLeft, canScrollRight, scrollGridBy } = useGridScrollAffordance(
    showTable,
    columns,
  )

  return (
    <>
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", width: "100%" }}>
        {/* Sidebar de filtros rápidos: atajos de un clic sobre los MISMOS
            filtros de siempre (popovers "Filtros"/"Avanzados" + el toggle de
            tareas pendientes), no un sistema de filtrado nuevo. Oculta en
            mobile/tablet para no robarle ancho a la tabla/tarjetas. */}
        {!isMdDown && (
          <LegajoFilterSidebar
            filters={apiFilters}
            onFilterChange={(partial) => {
              setApiFilters((prev) => ({ ...prev, ...partial }))
              setPaginationModel((prev) => ({ ...prev, page: 0 }))
            }}
            currentUserId={permissions.user?.id}
            tareasPendientesActivo={tareasPendientesActivo}
            onToggleTareasPendientes={() => {
              setTareasPendientesActivo((prev) => !prev)
              setPaginationModel((prev) => ({ ...prev, page: 0 }))
            }}
            tareasPendientesLoading={tareasPendientesActivo && isLoadingTareasPendientes}
            onClearAll={handleClearAllFilters}
          />
        )}
      <Paper
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <LegajoHeaderBar
          viewMode={viewMode}
          handleViewModeChange={handleViewModeChange}
          handleSearch={handleSearch}
          apiFilters={apiFilters}
          isLoading={isLoading}
          loadLegajos={loadLegajos}
          setApiFilters={setApiFilters}
          setPaginationModel={setPaginationModel}
        />
        <ActiveFiltersBar
          filters={apiFilters}
          totalResults={effectiveTotalCount}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={() => { handleClearAllFilters(); setTareasPendientesActivo(false) }}
          jefeZonalNames={jefeZonalNames}
          directorNames={directorNames}
          equipoTrabajoNames={equipoTrabajoNames}
          equipoCentroVidaNames={equipoCentroVidaNames}
          tareasPendientesActivo={tareasPendientesActivo}
          onRemoveTareasPendientes={() => setTareasPendientesActivo(false)}
        />
        {showTable && (
        <Box ref={gridContainerRef} sx={{ position: "relative", height: 650, width: "100%", bgcolor: "#ffffff" }}>
          <GridScrollButtons
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            scrollGridBy={scrollGridBy}
          />
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            sortingMode="server"
            rowCount={effectiveTotalCount}
            paginationMode={tareasPendientesActivo ? "client" : "server"}
            loading={isLoading || isUpdating}
            onRowClick={(params) => handleOpenModal(params.row.id)}
            localeText={{
              MuiTablePagination: {
                labelRowsPerPage: 'Filas por página:',
                labelDisplayedRows: ({ from, to, count }) =>
                  `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
              },
            }}
            slots={{ toolbar: () => <CustomToolbar onExportXlsx={handleExportXlsx} onRefresh={loadLegajos} /> }}
            getRowId={(row) => row.id}
            getRowClassName={(params) => {
              const classes: string[] = []
              if (shouldHighlightLegajo(params.row)) classes.push("highlight-pending")
              if (params.indexRelativeToCurrentPage % 2 === 0) classes.push("row-even")
              return classes.join(" ")
            }}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={legajoGridSx}
          />
        </Box>
        )}

        {showCardsList && (
          <Box
            sx={{
              display: "flex",
              height: { xs: "calc(100dvh - 320px)", md: "calc(100vh - 280px)" },
              minHeight: { xs: 360, md: 520 },
              bgcolor: "#fff",
            }}
          >
            {/* Left pane: 420px sidebar of cards (full width on mobile). */}
            <LegajoCardsList
              rows={cardsRows}
              isLoading={isLoading}
              selectedLegajoId={selectedLegajoId}
              handleOpenModal={handleOpenModal}
              totalCount={effectiveTotalCount}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
            />

            {/* Right pane: detail (desktop only — mobile uses the Drawer below). */}
            {!isMdDown && selectedLegajoId !== null && (
              <LegajoDetailPane selectedLegajoId={selectedLegajoId} handleCloseModal={handleCloseModal} />
            )}
          </Box>
        )}
      </Paper>
      </Box>

      {/* Mobile drawer for detail when in list mode */}
      {viewMode === "list" && isMdDown && (
        <LegajoDetailDrawer selectedLegajoId={selectedLegajoId} handleCloseModal={handleCloseModal} />
      )}
      <LegajoDetailModal
        open={isModalOpen && viewMode === "tabla"}
        selectedLegajoId={selectedLegajoId}
        handleCloseModal={handleCloseModal}
      />
      <AsignarLegajoModal open={isAsignarModalOpen} onClose={handleCloseAsignarModal} legajoId={selectedLegajoIdForAssignment} onAsignacionComplete={loadLegajos} />
    </>
  )
}

export default LegajoTable
