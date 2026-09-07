"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Paper, Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import { DataGrid, type GridPaginationModel } from "@mui/x-data-grid"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import AsignarModal from "@/components/asignarModal"
import LegajoSearchBar from "../../../legajo-mesa/components/search/LegajoSearchBar"
import { useUser } from "@/utils/auth/userZustand"

// Assume these imports are available in your project
import { get } from "@/app/api/apiService"
import { shadows, rgba } from "@/theme/colors"

import { buildDemandaColumns } from "./columns"
import { demandaGridLocaleText, demandaGridSx } from "./gridConfig"
import { exportDemandasToXlsx } from "./exportDemandas"
import { mapDemandaToRow } from "./utils"
import type { TDemandaPaginated } from "./types"
import { useColumnVisibility } from "./hooks/useColumnVisibility"
import { useViewMode } from "./hooks/useViewMode"
import { useGridScrollAffordance } from "./hooks/useGridScrollAffordance"
import { useDemandaMutations } from "./hooks/useDemandaMutations"
import { DemandaHeaderBar } from "./components/DemandaHeaderBar"
import { DemandaActionsBar } from "./components/DemandaActionsBar"
import { DemandaPresetBar } from "./components/DemandaPresetBar"
import { GridScrollButtons } from "./components/GridScrollButtons"
import { DemandaCardsList } from "./components/DemandaCardsList"
import { DemandaDetailPane, DemandaDetailDrawer, DemandaDetailModal } from "./components/DemandaDetailViews"


const DemandaTableContent: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"))
  const user = useUser((state) => state.user)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [totalCount, setTotalCount] = useState(0)
  const queryClient = useQueryClient()
  const [selectedDemandaId, setSelectedDemandaId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterState, setFilterState] = useState<{
    envio_de_respuesta: "NO_NECESARIO" | "PENDIENTE" | "ENVIADO" | null;
    estado_demanda: "SIN_ASIGNAR" | "CONSTATACION" | "EVALUACION" | "PENDIENTE_AUTORIZACION" | "ARCHIVADA" | "ADMITIDA" | null;
    objetivo_de_demanda: "CONSTATACION" | "PETICION_DE_INFORME" | null;
  }>({
    envio_de_respuesta: null,
    estado_demanda: null,
    objetivo_de_demanda: null,
  })
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false)
  const [selectedDemandaIdForAssignment, setSelectedDemandaIdForAssignment] = useState<number | null>(null)
  const [demandasData, setDemandasData] = useState<TDemandaPaginated | null>(null)

  const [apiFilters, setApiFilters] = useState<{
    envio_de_respuesta: "NO_NECESARIO" | "PENDIENTE" | "ENVIADO" | null;
    estado_demanda: "SIN_ASIGNAR" | "CONSTATACION" | "EVALUACION" | "PENDIENTE_AUTORIZACION" | "ARCHIVADA" | "ADMITIDA" | null;
    objetivo_de_demanda: "CONSTATACION" | "PETICION_DE_INFORME" | null;
    search: string | null;
  }>({
    envio_de_respuesta: null,
    estado_demanda: null,
    objetivo_de_demanda: null,
    search: null,
  })

  const { columnVisibilityModel, activePreset, handleVisibilityChange, handlePresetClick } = useColumnVisibility()

  const { viewMode, handleViewModeChange } = useViewMode()

  // Sync ?demanda=ID URL param -> selectedDemandaId on first mount and when URL changes externally.
  useEffect(() => {
    const fromUrl = searchParams.get("demanda")
    if (fromUrl) {
      const parsed = Number(fromUrl)
      if (!Number.isNaN(parsed)) setSelectedDemandaId(parsed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateUrlSelection = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id == null) params.delete("demanda")
    else params.set("demanda", String(id))
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : "?", { scroll: false })
  }

  // Check if user has permission to assign demandas
  const hasAssignPermission = user?.all_permissions?.includes('add_tdemandazona') ||
    user?.all_permissions?.includes('change_tdemandazona') ||
    user?.all_permissions?.includes('view_tdemandazona') ||
    user?.is_superuser ||
    user?.is_staff

  // Check if user has permission to evaluate
  const hasEvaluatePermission = user?.all_permissions?.includes('add_tevaluacion') ||
    user?.all_permissions?.includes('change_tevaluacion') ||
    user?.all_permissions?.includes('view_tevaluacion') ||
    user?.is_superuser ||
    user?.is_staff

  // GAP-18: Solo los Directores (y superusers) pueden calificar demandas.
  // El backend rechaza con 403 cualquier otro rol; por consistencia ocultamos el control.
  const isDirectorUser = user?.zonas?.some((z) => z.director) ||
    user?.groups?.some((g: any) => {
      const name = (g?.name || '').toLowerCase()
      return name === 'director' || name.startsWith('director ')
    }) || false
  const hasCalificarPermission = !!(user?.is_superuser || isDirectorUser)

  const fetchDemandas = async (pageNumber: number, pageSize: number): Promise<TDemandaPaginated> => {
    try {
      // Construct query parameters
      const params = new URLSearchParams()

      // Add pagination params
      params.append("page", (pageNumber + 1).toString())
      params.append("page_size", pageSize.toString())

      // Add filter params if they exist
      if (apiFilters.envio_de_respuesta) {
        params.append("envio_de_respuesta", apiFilters.envio_de_respuesta)
      }
      if (apiFilters.estado_demanda) {
        params.append("estado_demanda", apiFilters.estado_demanda)
      }
      if (apiFilters.objetivo_de_demanda) {
        params.append("objetivo_de_demanda", apiFilters.objetivo_de_demanda)
      }
      if (apiFilters.search) {
        params.append("search", apiFilters.search)
      }

      const response = await get<TDemandaPaginated>(`mesa-de-entrada/?${params.toString()}`)
      setTotalCount(response.count)
      const updatedResponse: TDemandaPaginated = {
        ...response,
        results: response.results.map((demanda: any) => ({
          ...demanda,
          demanda_zona_id: demanda.demanda_zona?.id,
        })),
      }
      setDemandasData(updatedResponse)
      return updatedResponse
    } catch (error) {
      console.error("Error al obtener las demandas:", error)
      throw error
    }
  }

  const handleFilterChange = (newFilters: {
    envio_de_respuesta: "NO_NECESARIO" | "PENDIENTE" | "ENVIADO" | null;
    estado_demanda: "SIN_ASIGNAR" | "CONSTATACION" | "EVALUACION" | "PENDIENTE_AUTORIZACION" | "ARCHIVADA" | "ADMITIDA" | null;
    objetivo_de_demanda: "CONSTATACION" | "PETICION_DE_INFORME" | null;
  }) => {
    setApiFilters((prev) => ({
      ...prev,
      envio_de_respuesta: newFilters.envio_de_respuesta,
      estado_demanda: newFilters.estado_demanda,
      objetivo_de_demanda: newFilters.objetivo_de_demanda,
    }))
    // Reset to first page when filters change
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleSearchChange = (term: string) => {
    const normalized = term.trim() ? term.trim() : null
    setApiFilters((prev) => {
      if (prev.search === normalized) return prev
      return { ...prev, search: normalized }
    })
    setPaginationModel((prev) => (prev.page === 0 ? prev : { ...prev, page: 0 }))
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["demandas", paginationModel.page, paginationModel.pageSize, filterState, apiFilters],
    queryFn: () => fetchDemandas(paginationModel.page, paginationModel.pageSize),
  })

  // Use useEffect to handle data updates
  useEffect(() => {
    if (data) {
      setDemandasData(data)
    }
  }, [data])

  const handleNuevoRegistro = () => {
    console.log("Nuevo registro clicked")
  }

  const handleOpenModal = (demandaId: number) => {
    setSelectedDemandaId(demandaId)
    updateUrlSelection(demandaId)
    // Modal is only used in tabla mode; list mode shows detail in the side pane.
    if (viewMode === "tabla") setIsModalOpen(true)
  }

  const { updateCalificacion, updateDemandaZona } = useDemandaMutations({
    demandasData,
    setDemandasData,
    queryClient,
    paginationModel,
    handleOpenModal,
  })

  const handleCalificacionChange = (demandaId: number, newValue: string) => {
    console.log(`Updating calificacion for demanda ${demandaId} to ${newValue}`)
    updateCalificacion.mutate({ demandaId, newValue })
  }


  const handleCloseModal = () => {
    setSelectedDemandaId(null)
    setIsModalOpen(false)
    updateUrlSelection(null)
  }

  // Click handler shared by both views: marks recibido (if needed) and selects the demanda.
  const handleSelectDemanda = (row: { id: number; recibido?: boolean; demanda_zona_id?: number | null }) => {
    if (!row.recibido && row.demanda_zona_id) {
      updateDemandaZona.mutate({
        id: row.demanda_zona_id,
        demandaId: row.id,
        userId: user?.id || 0,
      })
    } else {
      handleOpenModal(row.id)
    }
  }

  const handleOpenAsignarModal = (demandaId: number) => {
    setSelectedDemandaIdForAssignment(demandaId)
    setIsAsignarModalOpen(true)
  }

  const handleCloseAsignarModal = () => {
    setSelectedDemandaIdForAssignment(null)
    setIsAsignarModalOpen(false)
  }

  const columns = useMemo(
    () =>
      buildDemandaColumns({
        isMobile,
        userId: user?.id || 0,
        hasCalificarPermission,
        hasAssignPermission,
        hasEvaluatePermission,
        onCalificacionChange: handleCalificacionChange,
        onOpenModal: handleOpenModal,
        onOpenAsignarModal: handleOpenAsignarModal,
        onRecibirDemanda: updateDemandaZona.mutate,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobile],
  )

  const rows = demandasData?.results.map(mapDemandaToRow) || []

  // Add this function to handle Excel export
  const handleExportXlsx = () => exportDemandasToXlsx(rows)

  // Layout flags. List mode reuses the DataGrid for the "nothing selected" state on
  // desktop (denser scan view) and switches to a 420px sidebar of cards once a
  // demanda is opened. On mobile the cards list is always shown and detail is in a
  // Drawer, since DataGrid is unusable on small screens.
  const showTable = viewMode === "tabla" || (viewMode === "list" && !selectedDemandaId && !isMdDown)
  const showCardsList = viewMode === "list" && (isMdDown || selectedDemandaId !== null)

  const { gridContainerRef, canScrollLeft, canScrollRight, scrollGridBy } = useGridScrollAffordance(
    showTable,
    columnVisibilityModel,
  )

  if (isError) return <Typography color="error">Error al cargar la data</Typography>

  return (
    <>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
          boxShadow: shadows.subtle,
          border: `1px solid ${rgba.primaryLight(0.1)}`,
        }}
      >
        {/* Barra 1: Título */}
        <DemandaHeaderBar viewMode={viewMode} onViewModeChange={handleViewModeChange} />

        {/* Barra 2: Acciones (Nuevo Registro, Búsqueda, Filtros, Exportar, Refrescar) */}
        <DemandaActionsBar
          isLoading={isLoading}
          onNuevoRegistro={handleNuevoRegistro}
          onFilterChange={handleFilterChange}
          onExportXlsx={handleExportXlsx}
          onRefetch={refetch}
        />

        {/* Búsqueda inline: filtra la tabla server-side por demanda + NNyA + legajo + localización + códigos */}
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 1, md: 1.5 },
            borderBottom: "1px solid #e0e0e0",
            bgcolor: "#fff",
          }}
        >
          <LegajoSearchBar
            onSearch={handleSearchChange}
            initialValue={apiFilters.search ?? ""}
            placeholder="Buscar demanda por ID, NNyA (nombre/DNI), legajo vinculado, localización o código..."
            searchFieldsHint="Buscando en: ID de demanda, NNyA (nombre, apellido, DNI), legajo vinculado, localización (calle, localidad, barrio) y códigos de demanda"
            ariaLabel="Búsqueda de demandas"
          />
        </Box>

        {showTable && (
          <>
            {/* Vistas predefinidas: cada botón aplica un columnVisibilityModel preconfigurado */}
            <DemandaPresetBar activePreset={activePreset} onPresetClick={handlePresetClick} />

            <Box ref={gridContainerRef} sx={{ position: "relative", height: 600, width: "100%" }}>
              <GridScrollButtons
                canScrollLeft={canScrollLeft}
                canScrollRight={canScrollRight}
                scrollGridBy={scrollGridBy}
              />
              <DataGrid
                rows={rows}
                columns={columns}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={handleVisibilityChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                rowCount={totalCount}
                paginationMode="server"
                loading={isLoading || updateCalificacion.isPending || updateDemandaZona.isPending}
                localeText={demandaGridLocaleText}
                onRowClick={(params, event) => {
                  const cellElement = event.target as HTMLElement
                  if (
                    !cellElement.closest('.MuiDataGrid-cell[data-field="calificacion"]') &&
                    !cellElement.closest("a") &&
                    !cellElement.closest("button") &&
                    !cellElement.closest("select")
                  ) {
                    if (!params.row.recibido && params.row.demanda_zona_id) {
                      // Try to mark as received, but will still show details even if it fails with 403
                      updateDemandaZona.mutate({
                        id: params.row.demanda_zona_id,
                        demandaId: params.row.id,
                        userId: user?.id || 0,
                      })
                    } else {
                      handleOpenModal(params.row.id)
                    }
                  }
                }}
                sx={demandaGridSx}
                getRowClassName={(params) => {
                  const estado = params.row.estado_demanda?.toLowerCase() || ""
                  const recibido = params.row.recibido
                  return `row-${estado.replace(/_/g, "-")}${recibido ? " row-received" : " row-not-received"}`
                }}
              />
            </Box>
          </>
        )}

        {showCardsList && (
          <Box
            sx={{
              display: "flex",
              height: { xs: "calc(100dvh - 320px)", md: "calc(100vh - 240px)" },
              minHeight: { xs: 360, md: 520 },
              bgcolor: "#fff",
            }}
          >
            {/* Left pane: 420px sidebar of cards (full width on mobile). */}
            <DemandaCardsList
              rows={rows}
              isLoading={isLoading}
              selectedDemandaId={selectedDemandaId}
              onSelectDemanda={handleSelectDemanda}
              totalCount={totalCount}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
            />

            {/* Right pane: detail (desktop only — mobile uses the Drawer below). */}
            {!isMdDown && selectedDemandaId !== null && (
              <DemandaDetailPane selectedDemandaId={selectedDemandaId} onClose={handleCloseModal} />
            )}
          </Box>
        )}
      </Paper>

      {/* Mobile drawer for detail when in list mode */}
      {viewMode === "list" && isMdDown && (
        <DemandaDetailDrawer selectedDemandaId={selectedDemandaId} onClose={handleCloseModal} />
      )}
      <DemandaDetailModal
        open={isModalOpen && viewMode === "tabla"}
        selectedDemandaId={selectedDemandaId}
        onClose={handleCloseModal}
      />
      <AsignarModal
        open={isAsignarModalOpen}
        onClose={handleCloseAsignarModal}
        demandaId={selectedDemandaIdForAssignment}
        onSuccess={refetch}
      />
    </>
  )
}

export default DemandaTableContent
