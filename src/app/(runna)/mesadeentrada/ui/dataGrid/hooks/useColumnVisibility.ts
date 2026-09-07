"use client"

import { useState, useEffect } from "react"
import type { GridColumnVisibilityModel } from "@mui/x-data-grid"
import { PRESETS, PRESET_STORAGE_KEY, VISIBILITY_STORAGE_KEY } from "../constants"
import type { PresetKey } from "../types"

/**
 * Visibilidad de columnas del grid de demandas, persistida en localStorage junto
 * con el preset activo. El toggle manual de una columna sale de cualquier preset.
 */
export const useColumnVisibility = () => {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(() => {
    if (typeof window === "undefined") return PRESETS.pendientes.visibility
    try {
      const stored = window.localStorage.getItem(VISIBILITY_STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      /* ignore corrupt JSON */
    }
    return PRESETS.pendientes.visibility
  })

  const [activePreset, setActivePreset] = useState<PresetKey | null>(() => {
    if (typeof window === "undefined") return "pendientes"
    const stored = window.localStorage.getItem(PRESET_STORAGE_KEY) as PresetKey | null
    return stored && stored in PRESETS ? stored : "pendientes"
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(columnVisibilityModel))
    } catch {
      /* storage unavailable - ignore */
    }
  }, [columnVisibilityModel])

  const handleVisibilityChange = (next: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(next)
    // Manual toggle exits any active preset
    setActivePreset(null)
    try {
      window.localStorage.removeItem(PRESET_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  const handlePresetClick = (key: PresetKey) => {
    setColumnVisibilityModel(PRESETS[key].visibility)
    setActivePreset(key)
    try {
      window.localStorage.setItem(PRESET_STORAGE_KEY, key)
    } catch {
      /* ignore */
    }
  }

  return { columnVisibilityModel, activePreset, handleVisibilityChange, handlePresetClick }
}
