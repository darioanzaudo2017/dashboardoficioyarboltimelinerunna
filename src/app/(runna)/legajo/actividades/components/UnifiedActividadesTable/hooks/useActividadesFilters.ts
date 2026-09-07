"use client"

import { useState, useMemo, useCallback } from "react"
import type { GlobalActividadFilters } from "../../../services/globalActividadService"
import type { ActividadFilters } from "../../../../[id]/medida/[medidaId]/types/actividades"

/** Paginación + filtros de la tabla de actividades (estado y handlers). */
export const useActividadesFilters = () => {
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Filters
  const [filters, setFilters] = useState<GlobalActividadFilters & ActividadFilters>({
    search: "",
    estado: "",
    actor: "",
    origen: "",
    ordering: "-fecha_creacion",
  })

  // Has active filters - now consistent for all variants
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.search ||
      filters.estado ||
      filters.actor ||
      filters.origen ||
      (filters as GlobalActividadFilters).nnya_nombre ||
      (filters as GlobalActividadFilters).nnya_dni ||
      (filters as GlobalActividadFilters).numero_legajo ||
      (filters as GlobalActividadFilters).tipo_medida ||
      (filters as GlobalActividadFilters).categoria_oficio ||
      (filters as GlobalActividadFilters).tipo_oficio ||
      (filters as GlobalActividadFilters).estado_oficio ||
      (filters as GlobalActividadFilters).responsable ||
      (filters as GlobalActividadFilters).tipo_actividad ||
      (filters as GlobalActividadFilters).zona ||
      (filters as GlobalActividadFilters).fecha_desde ||
      (filters as GlobalActividadFilters).fecha_hasta ||
      (filters as GlobalActividadFilters).vencida ||
      (filters as GlobalActividadFilters).pendiente_visado ||
      (filters as GlobalActividadFilters).es_borrador ||
      (filters as GlobalActividadFilters).sin_leer // Sprint 2: Lectura Multi-Usuario
    )
  }, [filters])

  const handleFilterChange = useCallback((key: keyof GlobalActividadFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      estado: "",
      actor: "",
      origen: "",
      ordering: "-fecha_creacion",
      nnya_nombre: undefined,
      nnya_dni: undefined,
      numero_legajo: undefined,
      tipo_medida: undefined,
      categoria_oficio: undefined,
      tipo_oficio: undefined,
      estado_oficio: undefined,
      responsable: undefined,
      tipo_actividad: undefined,
      zona: undefined,
      fecha_desde: undefined,
      fecha_hasta: undefined,
      fecha_creacion_desde: undefined,
      fecha_creacion_hasta: undefined,
      vencida: undefined,
      pendiente_visado: undefined,
      es_borrador: undefined,
      dias_restantes_max: undefined,
      // Sprint 2: Lectura Multi-Usuario
      sin_leer: undefined,
      leida_por_mi: undefined,
    })
    setPage(0)
  }, [])

  return {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    filters,
    setFilters,
    hasActiveFilters,
    handleFilterChange,
    handleClearFilters,
  }
}
