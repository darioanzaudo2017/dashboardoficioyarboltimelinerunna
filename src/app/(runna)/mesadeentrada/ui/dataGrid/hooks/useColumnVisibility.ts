"use client"

import { useState, useEffect, useRef } from "react"
import type { GridColumnVisibilityModel } from "@mui/x-data-grid"
import { DEFAULT_PRESET, PRESETS, PRESET_STORAGE_KEY, VISIBILITY_STORAGE_KEY } from "../constants"
import type { PresetKey } from "../types"

/** Modelo guardado en localStorage, o el de la vista estandar si no hay nada usable. */
const leerVisibilidadGuardada = (): GridColumnVisibilityModel => {
  if (typeof window === "undefined") return PRESETS[DEFAULT_PRESET].visibility
  try {
    const stored = window.localStorage.getItem(VISIBILITY_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    /* ignore corrupt JSON */
  }
  return PRESETS[DEFAULT_PRESET].visibility
}

const leerPresetGuardado = (): PresetKey | null => {
  if (typeof window === "undefined") return DEFAULT_PRESET
  try {
    const stored = window.localStorage.getItem(PRESET_STORAGE_KEY) as PresetKey | null
    return stored && stored in PRESETS ? stored : DEFAULT_PRESET
  } catch {
    return DEFAULT_PRESET
  }
}

/**
 * Visibilidad de columnas del grid de demandas.
 *
 * Con `canCustomize` en true (jefe zonal, director, admin) se comporta como
 * siempre: el modelo y el preset activo se persisten en localStorage y el toggle
 * manual de una columna sale de cualquier preset.
 *
 * Con `canCustomize` en false el hook arranca SIEMPRE en la vista estandar
 * (`PRESETS[DEFAULT_PRESET]`) y no lee ni escribe localStorage. Ignorar lo
 * guardado es el punto del pedido, no un descuido: los usuarios que ya se habian
 * armado una vista propia tienen que volver a la estandar, si no arrastrarian su
 * personalizacion vieja para siempre y la vista nunca seria comun a todos.
 * Los presets siguen disponibles porque son vistas curadas, pero para estos
 * usuarios duran solo la sesion: al recargar vuelven a la estandar.
 */
export const useColumnVisibility = (canCustomize: boolean) => {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(() =>
    canCustomize ? leerVisibilidadGuardada() : PRESETS[DEFAULT_PRESET].visibility,
  )

  const [activePreset, setActivePreset] = useState<PresetKey | null>(() =>
    canCustomize ? leerPresetGuardado() : DEFAULT_PRESET,
  )

  // El store de usuario (zustand + persist) puede hidratar despues del primer
  // render, asi que `canCustomize` puede cambiar de valor una vez montados. Hay
  // que reaplicar en las dos direcciones: hacia false, volver a la estandar;
  // hacia true, recuperar lo guardado para no pisarle la vista a un responsable.
  const ultimoCanCustomize = useRef(canCustomize)
  useEffect(() => {
    if (ultimoCanCustomize.current === canCustomize) return
    ultimoCanCustomize.current = canCustomize
    setColumnVisibilityModel(canCustomize ? leerVisibilidadGuardada() : PRESETS[DEFAULT_PRESET].visibility)
    setActivePreset(canCustomize ? leerPresetGuardado() : DEFAULT_PRESET)
  }, [canCustomize])

  useEffect(() => {
    if (!canCustomize) return // la vista estandar no se persiste
    try {
      window.localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(columnVisibilityModel))
    } catch {
      /* storage unavailable - ignore */
    }
  }, [canCustomize, columnVisibilityModel])

  const handleVisibilityChange = (next: GridColumnVisibilityModel) => {
    // Sin permiso no hay menu de columnas, pero el guard evita que un cambio
    // emitido por el propio DataGrid rompa la vista estandar.
    if (!canCustomize) return
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
    if (!canCustomize) return // el preset elegido no sobrevive a la recarga
    try {
      window.localStorage.setItem(PRESET_STORAGE_KEY, key)
    } catch {
      /* ignore */
    }
  }

  return { columnVisibilityModel, activePreset, handleVisibilityChange, handlePresetClick }
}
