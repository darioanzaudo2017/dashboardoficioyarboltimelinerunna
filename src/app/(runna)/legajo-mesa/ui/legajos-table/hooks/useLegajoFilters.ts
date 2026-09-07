"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { GridPaginationModel } from "@mui/x-data-grid"
import type { LegajoFiltersState } from "../../legajos-filters"

/**
 * Filtros de la bandeja de legajos: estado persistido en sessionStorage y los
 * handlers que además resetean la paginación a la primera página.
 */
export const useLegajoFilters = (
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>,
) => {
  // Initialize filters from sessionStorage or default values
  const [apiFilters, setApiFilters] = useState<LegajoFiltersState & { search: string | null }>(() => {
    if (typeof window !== "undefined") {
      const savedFilters = sessionStorage.getItem("legajo-mesa-filters")
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters)
        } catch (error) {
          console.error("Error parsing saved filters:", error)
        }
      }
    }
    return {
      zona: null,
      urgencia: null,
      tiene_medidas_activas: null,
      tiene_oficios: null,
      tiene_plan_trabajo: null,
      tiene_alertas: null,
      tiene_demanda_pi: null,
      search: null,
      jefe_zonal: null,
      director: null,
      equipo_trabajo: null,
      equipo_centro_vida: null,
    }
  })

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("legajo-mesa-filters", JSON.stringify(apiFilters))
    }
  }, [apiFilters])

  const handleFilterChange = (newFilters: typeof apiFilters) => {
    setApiFilters(newFilters)
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleSearch = (searchTerm: string) => {
    setApiFilters((prev) => ({ ...prev, search: searchTerm || null }))
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleRemoveFilter = (filterKey: string) => {
    if (filterKey === "fecha_apertura") {
      setApiFilters((prev) => ({
        ...prev,
        fecha_apertura__gte: null,
        fecha_apertura__lte: null,
        fecha_apertura__ultimos_dias: null,
      }))
    } else if (filterKey === "id_filter") {
      setApiFilters((prev) => ({
        ...prev,
        id__gt: null,
        id__lt: null,
        id__gte: null,
        id__lte: null,
      }))
    } else {
      setApiFilters((prev) => ({ ...prev, [filterKey]: null }))
    }
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleClearAllFilters = () => {
    setApiFilters({
      zona: null,
      urgencia: null,
      tiene_medidas_activas: null,
      tiene_oficios: null,
      tiene_plan_trabajo: null,
      tiene_alertas: null,
      tiene_demanda_pi: null,
      search: null,
      jefe_zonal: null,
      director: null,
      equipo_trabajo: null,
      equipo_centro_vida: null,
    })
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  return {
    apiFilters,
    setApiFilters,
    handleFilterChange,
    handleSearch,
    handleRemoveFilter,
    handleClearAllFilters,
  }
}
