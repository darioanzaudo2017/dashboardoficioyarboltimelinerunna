import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid"
import type { LegajoApiResponse } from "../../types/legajo-api"
import type { LegajoFiltersState } from "../legajos-filters"

export const calculateAge = (birthDate?: string | null): number | null => {
  if (!birthDate) return null
  const [year, month, day] = birthDate.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return null
  const today = new Date()
  let age = today.getFullYear() - year
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1
  return age >= 0 ? age : null
}

// Build query params using useMemo - API uses 1-based pagination
export const buildLegajoQueryParams = (
  paginationModel: GridPaginationModel,
  apiFilters: LegajoFiltersState & { search: string | null },
  sortModel: GridSortModel,
) => {
  const params: any = {
    page: paginationModel.page + 1, // Convert from 0-based to 1-based
    page_size: paginationModel.pageSize,
  }

  // Add all filters if they exist
  if (apiFilters.zona !== null) {
    params.zona = apiFilters.zona
  }
  if (apiFilters.urgencia !== null) {
    params.urgencia = apiFilters.urgencia
  }
  if (apiFilters.search !== null && apiFilters.search.trim() !== "") {
    params.search = apiFilters.search
  }
  if (apiFilters.tiene_medidas_activas !== null) {
    params.tiene_medidas_activas = apiFilters.tiene_medidas_activas
  }
  if (apiFilters.tiene_oficios !== null) {
    params.tiene_oficios = apiFilters.tiene_oficios
  }
  if (apiFilters.tiene_plan_trabajo !== null) {
    params.tiene_plan_trabajo = apiFilters.tiene_plan_trabajo
  }
  if (apiFilters.tiene_alertas !== null) {
    params.tiene_alertas = apiFilters.tiene_alertas
  }
  if (apiFilters.tiene_demanda_pi !== null) {
    params.tiene_demanda_pi = apiFilters.tiene_demanda_pi
  }

  // Add numeric filters
  if (apiFilters.id__gt !== undefined && apiFilters.id__gt !== null) {
    params.id__gt = apiFilters.id__gt
  }
  if (apiFilters.id__lt !== undefined && apiFilters.id__lt !== null) {
    params.id__lt = apiFilters.id__lt
  }
  if (apiFilters.id__gte !== undefined && apiFilters.id__gte !== null) {
    params.id__gte = apiFilters.id__gte
  }
  if (apiFilters.id__lte !== undefined && apiFilters.id__lte !== null) {
    params.id__lte = apiFilters.id__lte
  }

  // Add date filters
  if (apiFilters.fecha_apertura__gte) {
    params.fecha_apertura__gte = apiFilters.fecha_apertura__gte
  }
  if (apiFilters.fecha_apertura__lte) {
    params.fecha_apertura__lte = apiFilters.fecha_apertura__lte
  }
  if (apiFilters.fecha_apertura__ultimos_dias !== undefined && apiFilters.fecha_apertura__ultimos_dias !== null) {
    params.fecha_apertura__ultimos_dias = apiFilters.fecha_apertura__ultimos_dias
  }

  // Add responsable filters
  if (apiFilters.jefe_zonal !== undefined && apiFilters.jefe_zonal !== null) {
    params.jefe_zonal = apiFilters.jefe_zonal
  }
  if (apiFilters.director !== undefined && apiFilters.director !== null) {
    params.director = apiFilters.director
  }
  if (apiFilters.equipo_trabajo !== undefined && apiFilters.equipo_trabajo !== null) {
    params.equipo_trabajo = apiFilters.equipo_trabajo
  }
  if (apiFilters.equipo_centro_vida !== undefined && apiFilters.equipo_centro_vida !== null) {
    params.equipo_centro_vida = apiFilters.equipo_centro_vida
  }
  if (apiFilters.user_responsable !== undefined && apiFilters.user_responsable !== null) {
    params.user_responsable = apiFilters.user_responsable
  }

  if (apiFilters.demanda_estado) params.demanda_estado = apiFilters.demanda_estado
  if (apiFilters.medida_tipo?.length) params.medida_tipo = apiFilters.medida_tipo.join(",")
  if (apiFilters.medida_estado?.length) params.medida_estado = apiFilters.medida_estado.join(",")
  if (apiFilters.oficio_tipo?.length) params.oficio_tipo = apiFilters.oficio_tipo.join(",")
  if (apiFilters.oficios_proximos_vencer != null) params.oficios_proximos_vencer = apiFilters.oficios_proximos_vencer
  if (apiFilters.oficios_vencidos != null) params.oficios_vencidos = apiFilters.oficios_vencidos
  if (apiFilters.pt_pendientes != null) params.pt_pendientes = apiFilters.pt_pendientes
  if (apiFilters.pt_en_progreso != null) params.pt_en_progreso = apiFilters.pt_en_progreso
  if (apiFilters.pt_vencidas != null) params.pt_vencidas = apiFilters.pt_vencidas
  if (apiFilters.etapa_medida) params.etapa_medida = apiFilters.etapa_medida

  // Add sorting (multi-column support)
  if (sortModel.length > 0) {
    // Map DataGrid field names → Django ordering field names where they differ
    const fieldMap: Record<string, string> = {
      indicadores_alertas: "has_alerta",
    }
    const ordering = sortModel
      .map((sort) => {
        const prefix = sort.sort === "desc" ? "-" : ""
        const field = fieldMap[sort.field] ?? sort.field
        return `${prefix}${field}`
      })
      .join(",")
    params.ordering = ordering
  }

  return params
}

/** Proyecta un legajo del backend a la fila que consumen la tabla y las tarjetas. */
export const mapLegajoToRow = (legajo: LegajoApiResponse) => {
  let ultimaActualizacionFormatted = "N/A"
  if (legajo.fecha_ultima_actualizacion) {
    const date = new Date(legajo.fecha_ultima_actualizacion)
    if (!isNaN(date.getTime())) {
      ultimaActualizacionFormatted = date.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    }
  }

  const medidasCount = Array.isArray(legajo.medidas_activas) ? legajo.medidas_activas.length : 0
  const medidaActual = Array.isArray(legajo.medidas_activas)
    ? legajo.medidas_activas.find((medida) => medida.estado_vigencia === "VIGENTE") || legajo.medidas_activas[0]
    : undefined
  const actividadesCount = Array.isArray(legajo.actividades_activas) ? legajo.actividades_activas.length : 0
  const oficiosCount = Array.isArray(legajo.oficios) ? legajo.oficios.length : 0

  const zonaValue = typeof legajo.zona === "string" ? legajo.zona : (legajo.zona as any)?.nombre || null
  const equipoTrabajoValue = typeof legajo.equipo_trabajo === "string" ? legajo.equipo_trabajo : (legajo.equipo_trabajo as any)?.nombre || null
  const userResponsableValue = typeof legajo.user_responsable === "string" ? legajo.user_responsable : (legajo.user_responsable as any)?.nombre_completo || null
  const jefeZonalValue = typeof legajo.jefe_zonal === "string" ? legajo.jefe_zonal : (legajo.jefe_zonal as any)?.nombre_completo || null

  return {
    id: legajo.id,
    numero_legajo: legajo.numero || `L-${legajo.id}`,
    nombre: legajo.nnya?.nombre || "N/A",
    apellido: legajo.nnya?.apellido || "N/A",
    dni: legajo.nnya?.dni ? String(legajo.nnya.dni) : "N/A",
    edad: calculateAge(legajo.nnya?.fecha_nacimiento),
    prioridad: legajo.prioridad || null,
    ultimaActualizacion: ultimaActualizacionFormatted,
    medidas_activas_count: medidasCount,
    tipo_medida_actual: medidaActual?.tipo_medida || null,
    estado_medida_actual: medidaActual?.estado_vigencia || null,
    actividades_activas_count: actividadesCount,
    oficios_count: oficiosCount,
    zona: zonaValue,
    equipo_trabajo: equipoTrabajoValue,
    profesional_asignado: userResponsableValue,
    jefe_zonal: jefeZonalValue,
    fecha_apertura: legajo.fecha_apertura,
    medidas_activas: legajo.medidas_activas,
    indicadores: legajo.indicadores,
    alertas: legajo.alertas || legajo.indicadores?.alertas || [],
    oficios: legajo.oficios,
    // Nota: se elimino el campo `allStates` (bolsa con estados, nombres de etapa
    // e historicos). Las alertas virtuales y el resaltado de filas ahora leen el
    // estado actual de la etapa actual desde `medidas_activas` / `indicadores`
    // (ver getEstadosEtapaActual en @/utils/notification-utils).
  }
}

export type LegajoRow = ReturnType<typeof mapLegajoToRow>
