"use client"

import { useState, useMemo, useCallback } from "react"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"

/** Selección múltiple de actividades sobre la página visible. */
export const useActividadesSelection = (paginatedActividades: TActividadPlanTrabajo[]) => {
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Selection helpers
  const selectedActividades = useMemo(
    () => paginatedActividades.filter((a) => selectedIds.has(a.id)),
    [paginatedActividades, selectedIds]
  )

  const isAllSelected = useMemo(
    () => paginatedActividades.length > 0 && paginatedActividades.every((a) => selectedIds.has(a.id)),
    [paginatedActividades, selectedIds]
  )

  const isIndeterminate = useMemo(() => selectedIds.size > 0 && !isAllSelected, [selectedIds, isAllSelected])

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      const newSelected = new Set(selectedIds)
      paginatedActividades.forEach((a) => newSelected.delete(a.id))
      setSelectedIds(newSelected)
    } else {
      const newSelected = new Set(selectedIds)
      paginatedActividades.forEach((a) => newSelected.add(a.id))
      setSelectedIds(newSelected)
    }
  }, [isAllSelected, paginatedActividades, selectedIds])

  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        newSelected.add(id)
      }
      return newSelected
    })
  }, [])

  return {
    selectedIds,
    setSelectedIds,
    selectedActividades,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectOne,
  }
}
