"use client"

import React, { useMemo, useCallback } from "react"
import { Box, Paper, Typography, Grid, Skeleton } from "@mui/material"
import AssignmentIcon from "@mui/icons-material/Assignment"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { useUser } from "@/utils/auth/userZustand"

// Import types
import type { TActividadPlanTrabajo } from "../../../[id]/medida/[medidaId]/types/actividades"

// Import reusable components
import { useActorVisibility } from "../../../[id]/medida/[medidaId]/hooks/useActorVisibility"
import { AdvancedFiltersPanel } from "../AdvancedFiltersPanel"
import { SectionCard } from "../../../[id]/medida/[medidaId]/components/medida/shared/section-card"

import type { UnifiedActividadesTableProps } from "./types"
import { buildFeatures } from "./features"
import { useActividadesFilters } from "./hooks/useActividadesFilters"
import { useActividadModals } from "./hooks/useActividadModals"
import { useActividadesQuery } from "./hooks/useActividadesQuery"
import { useActividadLectura } from "./hooks/useActividadLectura"
import { useActividadesSelection } from "./hooks/useActividadesSelection"
import { ActividadesStatisticsPanel } from "./parts/ActividadesStatisticsPanel"
import { BulkActionsToolbar } from "./parts/BulkActionsToolbar"
import { ActividadesTable } from "./parts/ActividadesTable"
import { ActividadesContent } from "./parts/ActividadesContent"
import { ActividadesWrapper } from "./parts/ActividadesWrapper"
import { ActividadesModals } from "./parts/ActividadesModals"
import { AcuseReciboDialog } from "./parts/AcuseReciboDialog"

// ============================================================================
// UNIFIED COMPONENT
// ============================================================================

export const UnifiedActividadesTable: React.FC<UnifiedActividadesTableProps> = ({
  variant,
  actividades: propActividades,
  planTrabajoId,
  medidaData,
  filterEtapa,
  excludeActors,
  onRefresh,
  onActividadesUpdate,
  title,
  showWrapper = true,
}) => {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  useUser() // For auth context

  // Óptica del legajo en una medida COMPARTIDA. La variante "medida" siempre se
  // renderiza bajo la ruta /legajo/[id]/medida/[medidaId], por lo que params.id
  // es el legajo desde el que se está viendo el plan de trabajo. Se usa para
  // pedir al backend solo las actividades grupales + las de ESTE legajo
  // (?legajo_id=), igual que el filtro visual de etapas (Mejora 3,
  // ver claudedocs/MEDIDA_COMPARTIDA_VISTA_LEGAJO_FRONTEND.md). En las variantes
  // "global"/"legajo" no aplica (no hay óptica de un único legajo).
  const legajoIdFromRoute = (() => {
    if (variant !== "medida") return undefined
    const raw = Array.isArray(params?.id) ? params.id[0] : params?.id
    const n = raw != null ? Number(raw) : NaN
    return Number.isNaN(n) ? undefined : n
  })()
  const { user } = useUser()
  const { actorFilter, allowedActors, isActorAllowed, canSeeAllActors } = useActorVisibility()

  // Granularidad: armar lista de legajos vinculados a la medida para chips/tooltip.
  const legajosLabelMap = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {}
    const primario = medidaData?.legajo
    if (primario?.id != null) {
      const nombre = primario.nnya?.nombre ?? ""
      const apellido = primario.nnya?.apellido ?? ""
      map[primario.id] = `Legajo ${primario.numero} — ${nombre} ${apellido}`.trim()
    }
    const adicionales: any[] = medidaData?.legajos_adicionales ?? []
    adicionales.forEach((la) => {
      if (la.legajo_id != null) {
        map[la.legajo_id] = `Legajo ${la.legajo_numero} — ${la.nnya?.nombre_completo ?? ""}`.trim()
      }
    })
    return map
  }, [medidaData?.legajo, medidaData?.legajos_adicionales])

  const hasMultipleLegajos = (medidaData?.legajos_adicionales?.length ?? 0) > 0

  // Determine user roles for highlighting
  const roles = useMemo(() => {
    if (!user) return { isET: false, isJZ: false, isLegal: false, user_id: null }
    const groups = user.groups || []
    const groupNames = groups.map((g) => g.name.toLowerCase())
    const isJZ = groupNames.includes("jefe zonal") || groupNames.includes("jz")
    const isDirector =
      groupNames.includes("director provincial") || groupNames.includes("director interior") || groupNames.includes("director")
    const isLegal = groupNames.includes("legales") || groupNames.includes("equipo legal") || user.zonas?.some((z) => z.legal === true)
    const isET = groupNames.includes("equipo técnico") || groupNames.includes("equipo tecnico") || (!isJZ && !isDirector && !isLegal)

    return {
      isET,
      isJZ: isJZ || isDirector,
      isLegal,
      user_id: user.id
    }
  }, [user])

  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    filters,
    hasActiveFilters,
    handleFilterChange,
    handleClearFilters,
  } = useActividadesFilters()

  const modals = useActividadModals()
  const {
    setDetailModalOpen,
    setEditModalOpen,
    setCancelModalOpen,
    setAsignarModalOpen,
    setBulkModalOpen,
    setPlanAccionModalOpen,
    setSelectedActividad,
    pendingAcuseActividad,
    setPendingAcuseActividad,
  } = modals

  const {
    actividades,
    totalCount,
    isLoading,
    isFetching,
    filteredActividades,
    paginatedActividades,
    globalError,
    globalRefetch,
    medidaRefetch,
  } = useActividadesQuery({
    variant,
    filters,
    page,
    rowsPerPage,
    actorFilter,
    canSeeAllActors,
    allowedActors,
    isActorAllowed,
    propActividades,
    planTrabajoId,
    legajoIdFromRoute,
    filterEtapa,
    excludeActors,
  })

  const { marcarLeidaMutation, isActivityRead, shouldHighlightForRole } = useActividadLectura({
    queryClient,
    onRefresh,
    user,
    roles,
  })

  // Statistics
  const statistics = useMemo(() => {
    const sourceData = variant === "global" ? actividades : filteredActividades
    const total = sourceData.length
    const pendientes = sourceData.filter((a) => a.estado === "PENDIENTE").length
    const enProgreso = sourceData.filter((a) => a.estado === "EN_PROGRESO").length
    const realizadas = sourceData.filter((a) => a.estado === "COMPLETADA" || a.estado === "VISADO_APROBADO").length
    const vencidas = sourceData.filter((a) => a.esta_vencida && a.estado === "PENDIENTE").length
    const completionRate = total > 0 ? (realizadas / total) * 100 : 0

    return { total, pendientes, enProgreso, realizadas, vencidas, completionRate }
  }, [actividades, filteredActividades, variant])

  const {
    selectedIds,
    setSelectedIds,
    selectedActividades,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectOne,
  } = useActividadesSelection(paginatedActividades)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(() => {
    if (variant === "global") {
      globalRefetch()
    } else if (variant === "medida") {
      medidaRefetch()
    }
    onRefresh?.()
  }, [variant, globalRefetch, medidaRefetch, onRefresh])

  const handleViewDetail = useCallback((actividad: TActividadPlanTrabajo) => {
    // Sprint 2: Auto-mark as read when viewing detail (all variants)
    if (!isActivityRead(actividad)) {
      marcarLeidaMutation.mutate(actividad.id)
    }
    setSelectedActividad(actividad)
    setDetailModalOpen(true)
  }, [isActivityRead, marcarLeidaMutation])

  const handleEdit = useCallback((actividad: TActividadPlanTrabajo) => {
    setSelectedActividad(actividad)
    setEditModalOpen(true)
  }, [])

  const handleCancel = useCallback((actividad: TActividadPlanTrabajo) => {
    setSelectedActividad(actividad)
    setCancelModalOpen(true)
  }, [])

  const handleAssign = useCallback((actividad: TActividadPlanTrabajo) => {
    setSelectedActividad(actividad)
    setAsignarModalOpen(true)
  }, [])

  const handleGoToLegajo = useCallback(
    (actividad: TActividadPlanTrabajo) => {
      if (actividad.legajo_info?.id && actividad.medida_info?.id) {
        router.push(`/legajo/${actividad.legajo_info.id}/medida/${actividad.medida_info.id}`)
      } else {
        handleViewDetail(actividad)
      }
    },
    [router, handleViewDetail]
  )

  const handleRequestAcuse = useCallback(
    (actividad: TActividadPlanTrabajo) => {
      // Sprint 2: Use backend-based read status (leida_por_mi field)
      if (isActivityRead(actividad)) {
        handleViewDetail(actividad)
      } else {
        setPendingAcuseActividad(actividad)
      }
    },
    [isActivityRead, handleViewDetail]
  )

  const handleConfirmAcuse = useCallback(() => {
    if (pendingAcuseActividad) {
      // Sprint 2: Mark as read via backend API
      marcarLeidaMutation.mutate(pendingAcuseActividad.id)

      setSelectedActividad(pendingAcuseActividad)
      setDetailModalOpen(true)
      setPendingAcuseActividad(null)
    }
  }, [pendingAcuseActividad, marcarLeidaMutation])

  const handleRowClick = useCallback(
    (actividad: TActividadPlanTrabajo) => {
      // All variants: Use Acuse de Recibo flow for unread activities
      handleRequestAcuse(actividad)
    },
    [handleRequestAcuse]
  )

  const handleBulkSuccess = useCallback((updatedActividades?: TActividadPlanTrabajo[]) => {
    setSelectedIds(new Set())
    setBulkModalOpen(false)

    // For prop-based data (legajo variant), merge updated actividades and notify parent
    if (variant === "legajo" && updatedActividades && updatedActividades.length > 0 && propActividades) {
      // Create a map of updated actividades by ID for quick lookup
      const updatedMap = new Map(updatedActividades.map(a => [a.id, a]))

      // Merge: replace existing items with updated ones
      const mergedActividades = propActividades.map(actividad =>
        updatedMap.has(actividad.id) ? updatedMap.get(actividad.id)! : actividad
      )

      // Notify parent of the update so it can update its state
      onActividadesUpdate?.(mergedActividades)
    } else {
      // For API-based data, just refresh
      handleRefresh()
    }
  }, [handleRefresh, variant, propActividades, onActividadesUpdate])

  const handleModalSuccess = useCallback(() => {
    handleRefresh()
  }, [handleRefresh])

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================

  const features = useMemo(() => buildFeatures(variant), [variant])

  // ============================================================================
  // RENDER: LOADING
  // ============================================================================

  if (isLoading && actividades.length === 0) {
    return (
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={400} />
      </Paper>
    )
  }

  // ============================================================================
  // RENDER: NO PLAN TRABAJO (legajo variant)
  // ============================================================================

  if (variant === "legajo" && (!propActividades || propActividades.length === 0) && !hasActiveFilters) {
    const emptyContent = (
      <Box sx={{ textAlign: "center", py: 6, bgcolor: "grey.50", borderRadius: 2 }}>
        <AssignmentIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          No hay plan de trabajo asignado para este legajo.
        </Typography>
      </Box>
    )

    if (features.useSectionCard && showWrapper) {
      return <SectionCard title={title || "Plan de Trabajo"}>{emptyContent}</SectionCard>
    }
    return emptyContent
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStatistics = () => (
    <ActividadesStatisticsPanel
      variant={variant}
      features={features}
      filteredActividades={filteredActividades}
      statistics={statistics}
      totalCount={totalCount}
    />
  )

  const renderFilters = () => {
    // Advanced Filters - now shown for ALL variants
    if (features.showAdvancedFilters) {
      return (
        <AdvancedFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          canSeeAllActors={canSeeAllActors}
          variant={variant}
        />
      )
    }

    return null
  }

  const renderBulkActionsToolbar = () => (
    <BulkActionsToolbar
      features={features}
      selectedIds={selectedIds}
      setSelectedIds={setSelectedIds}
      setBulkModalOpen={setBulkModalOpen}
    />
  )

  const renderTable = () => (
    <ActividadesTable
      variant={variant}
      paginatedActividades={paginatedActividades}
      features={features}
      selectedIds={selectedIds}
      hasActiveFilters={hasActiveFilters}
      isAllSelected={isAllSelected}
      isIndeterminate={isIndeterminate}
      legajosLabelMap={legajosLabelMap}
      hasMultipleLegajos={hasMultipleLegajos}
      isActivityRead={isActivityRead}
      shouldHighlightForRole={shouldHighlightForRole}
      handleClearFilters={handleClearFilters}
      handleSelectAll={handleSelectAll}
      handleSelectOne={handleSelectOne}
      handleRowClick={handleRowClick}
      handleViewDetail={handleViewDetail}
      handleRequestAcuse={handleRequestAcuse}
      handleEdit={handleEdit}
      handleCancel={handleCancel}
      handleAssign={handleAssign}
      handleGoToLegajo={handleGoToLegajo}
    />
  )

  // ============================================================================
  // RENDER: MODALS
  // ============================================================================

  return (
    <>
      <ActividadesWrapper
        showWrapper={showWrapper}
        features={features}
        title={title}
        statistics={statistics}
        isFetching={isFetching}
        actividades={actividades}
      >
        <ActividadesContent
          variant={variant}
          title={title}
          features={features}
          hasActiveFilters={hasActiveFilters}
          handleClearFilters={handleClearFilters}
          handleRefresh={handleRefresh}
          setPlanAccionModalOpen={setPlanAccionModalOpen}
          globalError={globalError}
          actividades={actividades}
          filteredActividades={filteredActividades}
          totalCount={totalCount}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          renderStatistics={renderStatistics}
          renderFilters={renderFilters}
          renderBulkActionsToolbar={renderBulkActionsToolbar}
          renderTable={renderTable}
        />
      </ActividadesWrapper>

      <ActividadesModals
        modals={modals}
        features={features}
        medidaData={medidaData}
        planTrabajoId={planTrabajoId}
        filterEtapa={filterEtapa}
        selectedActividades={selectedActividades}
        handleModalSuccess={handleModalSuccess}
        handleBulkSuccess={handleBulkSuccess}
      />

      <AcuseReciboDialog
        features={features}
        pendingAcuseActividad={pendingAcuseActividad}
        setPendingAcuseActividad={setPendingAcuseActividad}
        handleConfirmAcuse={handleConfirmAcuse}
      />
    </>
  )
}

export default UnifiedActividadesTable
