"use client"

import { useMemo } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { globalActividadService, type GlobalActividadFilters } from "../../../services/globalActividadService"
import { actividadService } from "../../../../[id]/medida/[medidaId]/services/actividadService"
import type {
  TActividadPlanTrabajo,
  ActividadFilters,
  ActividadListResponse,
  ActorEnum,
} from "../../../../[id]/medida/[medidaId]/types/actividades"
import { extractArray } from "@/hooks/useApiQuery"
import type { TableVariant } from "../types"

interface UseActividadesQueryOptions {
  variant: TableVariant
  filters: GlobalActividadFilters & ActividadFilters
  page: number
  rowsPerPage: number
  actorFilter: ActorEnum | null
  canSeeAllActors: boolean
  allowedActors: ActorEnum[]
  isActorAllowed: (actor: ActorEnum) => boolean
  propActividades: TActividadPlanTrabajo[] | undefined
  planTrabajoId: number | undefined
  legajoIdFromRoute: number | undefined
  filterEtapa: "APERTURA" | "PROCESO" | "CESE" | undefined
  excludeActors: string[] | undefined
}

/**
 * Capa de datos de la tabla: consultas global/medida, normalización de la
 * respuesta y el filtrado + paginado cliente que aplican las variantes
 * "legajo" y "medida".
 */
export const useActividadesQuery = ({
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
}: UseActividadesQueryOptions) => {
  // Build effective filters with actor restriction
  const effectiveFilters = useMemo(() => {
    const baseFilters: GlobalActividadFilters = {
      ...filters,
      page: page + 1,
      page_size: rowsPerPage,
    }

    if (!canSeeAllActors && actorFilter) {
      baseFilters.actor = actorFilter
    } else if (filters.actor) {
      baseFilters.actor = filters.actor
    }

    return baseFilters
  }, [filters, page, rowsPerPage, actorFilter, canSeeAllActors])

  // Global variant: fetch from global API
  const {
    data: globalResponse,
    isLoading: globalLoading,
    isFetching: globalFetching,
    error: globalError,
    refetch: globalRefetch,
  } = useQuery({
    queryKey: ["global-actividades", effectiveFilters],
    queryFn: () => globalActividadService.list(effectiveFilters),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: variant === "global",
  })

  // Medida variant: fetch from plan trabajo API.
  // `legajo_id` filtra actividades grupales + las de ESTE legajo dentro de una
  // medida compartida (omitido cuando no hay legajo en la ruta).
  const medidaFilters = {
    ...filters,
    ...(actorFilter && { actor: actorFilter }),
    ...(legajoIdFromRoute != null && { legajo_id: legajoIdFromRoute }),
    ordering: "-fecha_creacion",
  }
  const {
    data: medidaResponse,
    isLoading: medidaLoading,
    refetch: medidaRefetch,
  } = useQuery<ActividadListResponse | TActividadPlanTrabajo[]>({
    queryKey: ["actividades-plan", planTrabajoId, medidaFilters],
    queryFn: () => actividadService.list(planTrabajoId!, medidaFilters),
    enabled: variant === "medida" && !!planTrabajoId,
    staleTime: 2 * 60 * 1000,
  })

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  // Parse actividades from the appropriate source
  const { actividades, totalCount, isLoading, isFetching } = useMemo<{
    actividades: TActividadPlanTrabajo[]
    totalCount: number
    isLoading: boolean
    isFetching: boolean
  }>(() => {
    if (variant === "legajo") {
      // Use prop data for legajo variant
      return {
        actividades: propActividades || [],
        totalCount: propActividades?.length || 0,
        isLoading: false,
        isFetching: false,
      }
    }

    if (variant === "global") {
      if (!globalResponse) {
        return { actividades: [], totalCount: 0, isLoading: globalLoading, isFetching: globalFetching }
      }
      const items = extractArray<TActividadPlanTrabajo>(globalResponse as any)
      const count =
        !Array.isArray(globalResponse) && globalResponse && typeof globalResponse === "object" && "count" in globalResponse
          ? (globalResponse as any).count ?? items.length
          : items.length
      return { actividades: items, totalCount: count, isLoading: globalLoading, isFetching: globalFetching }
    }

    if (variant === "medida") {
      if (!medidaResponse) {
        return { actividades: [], totalCount: 0, isLoading: medidaLoading, isFetching: false }
      }
      if (Array.isArray(medidaResponse)) {
        return { actividades: medidaResponse, totalCount: medidaResponse.length, isLoading: medidaLoading, isFetching: false }
      }
      return {
        actividades: medidaResponse.results || [],
        totalCount: medidaResponse.count || 0,
        isLoading: medidaLoading,
        isFetching: false,
      }
    }

    return { actividades: [], totalCount: 0, isLoading: false, isFetching: false }
  }, [variant, propActividades, globalResponse, medidaResponse, globalLoading, globalFetching, medidaLoading])

  // Apply client-side filtering (for legajo variant which gets data from props)
  const filteredActividades = useMemo(() => {
    let result = actividades

    // Exclude specific actors (e.g., EQUIPO_LEGAL for separate Kanban display)
    if (excludeActors && excludeActors.length > 0) {
      result = result.filter((actividad) => !excludeActors.includes(actividad.actor))
    }

    // Actor visibility filtering
    if (!canSeeAllActors && allowedActors.length > 0) {
      result = result.filter((actividad) => isActorAllowed(actividad.actor))
    }

    // Etapa filtering (medida variant with MPJ)
    if (variant === "medida" && filterEtapa) {
      result = result.filter(
        (actividad) =>
          actividad.tipo_actividad_info?.etapa_medida_aplicable === filterEtapa ||
          actividad.tipo_actividad_info?.etapa_medida_aplicable === null
      )
    }

    // Client-side filtering for legajo variant (props-based data)
    if (variant === "legajo") {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(
          (actividad) =>
            actividad.tipo_actividad_info?.nombre?.toLowerCase().includes(searchLower) ||
            actividad.subactividad?.toLowerCase().includes(searchLower) ||
            actividad.descripcion?.toLowerCase().includes(searchLower) ||
            actividad.responsable_principal_info?.nombre_completo?.toLowerCase().includes(searchLower)
        )
      }

      // Estado filter
      if (filters.estado) {
        result = result.filter((actividad) => actividad.estado === filters.estado)
      }

      // Actor filter
      if (filters.actor) {
        result = result.filter((actividad) => actividad.actor === filters.actor)
      }

      // Vencida filter
      const globalFilters = filters as GlobalActividadFilters
      if (globalFilters.vencida === true) {
        result = result.filter((actividad) => actividad.esta_vencida && actividad.estado === "PENDIENTE")
      }

      // Tipo actividad filter
      if (globalFilters.tipo_actividad) {
        result = result.filter((actividad) => actividad.tipo_actividad === Number(globalFilters.tipo_actividad))
      }

      // Responsable filter
      if (globalFilters.responsable) {
        result = result.filter(
          (actividad) =>
            actividad.responsable_principal === Number(globalFilters.responsable) ||
            actividad.responsables_secundarios?.includes(Number(globalFilters.responsable))
        )
      }

      // Fecha desde filter
      if (globalFilters.fecha_desde) {
        const fechaDesde = new Date(globalFilters.fecha_desde)
        result = result.filter((actividad) => {
          if (!actividad.fecha_planificacion) return false
          return new Date(actividad.fecha_planificacion) >= fechaDesde
        })
      }

      // Fecha hasta filter
      if (globalFilters.fecha_hasta) {
        const fechaHasta = new Date(globalFilters.fecha_hasta)
        result = result.filter((actividad) => {
          if (!actividad.fecha_planificacion) return false
          return new Date(actividad.fecha_planificacion) <= fechaHasta
        })
      }
    }

    return result
  }, [actividades, variant, canSeeAllActors, allowedActors, isActorAllowed, filterEtapa, filters])

  // Paginated actividades (client-side for legajo/medida, server-side for global)
  const paginatedActividades = useMemo(() => {
    if (variant === "global") {
      // Server-side pagination
      return filteredActividades
    }
    // Client-side pagination
    const start = page * rowsPerPage
    return filteredActividades.slice(start, start + rowsPerPage)
  }, [filteredActividades, page, rowsPerPage, variant])

  return {
    actividades,
    totalCount,
    isLoading,
    isFetching,
    filteredActividades,
    paginatedActividades,
    globalError,
    globalRefetch,
    medidaRefetch,
  }
}
