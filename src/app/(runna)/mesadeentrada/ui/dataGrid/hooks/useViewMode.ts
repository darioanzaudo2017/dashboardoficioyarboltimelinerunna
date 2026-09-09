"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { VIEW_MODE_STORAGE_KEY } from "../constants"
import type { ViewMode } from "../types"

/**
 * Modo de vista estandar. Ojo: "list" no significa "siempre tarjetas". Es el
 * modo adaptativo, y DemandaTableContent lo resuelve segun el ancho de pantalla
 * (tabla en desktop sin detalle abierto, tarjetas en <=md y en mobile). "tabla"
 * en cambio fuerza el DataGrid incluso en pantallas chicas, donde es inusable.
 * Por eso la vista estandar -la del usuario que ya no tiene el toggle- es "list".
 */
export const DEFAULT_VIEW_MODE: ViewMode = "list"

const leerModoGuardado = (): ViewMode => {
  if (typeof window === "undefined") return DEFAULT_VIEW_MODE
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY) as ViewMode | null
    return stored === "list" || stored === "tabla" ? stored : DEFAULT_VIEW_MODE
  } catch {
    return DEFAULT_VIEW_MODE
  }
}

/**
 * Modo de vista (lista adaptativa vs. tabla fija).
 *
 * Solo se persiste en localStorage para quienes pueden personalizar. El resto
 * queda fijo en DEFAULT_VIEW_MODE ignorando lo guardado, para que un "tabla"
 * elegido antes de este cambio no les deje la bandeja rota en el celular.
 */
export const useViewMode = (canCustomize: boolean) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    canCustomize ? leerModoGuardado() : DEFAULT_VIEW_MODE,
  )

  // Mismo motivo que en useColumnVisibility: el store de usuario puede hidratar
  // despues del primer render y cambiar el valor de canCustomize.
  const ultimoCanCustomize = useRef(canCustomize)
  useEffect(() => {
    if (ultimoCanCustomize.current === canCustomize) return
    ultimoCanCustomize.current = canCustomize
    setViewMode(canCustomize ? leerModoGuardado() : DEFAULT_VIEW_MODE)
  }, [canCustomize])

  useEffect(() => {
    if (!canCustomize) return // la vista estandar no se persiste
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
    } catch {
      /* ignore */
    }
  }, [canCustomize, viewMode])

  const handleViewModeChange = (_e: React.MouseEvent<HTMLElement>, next: ViewMode | null) => {
    if (!canCustomize) return
    if (next) setViewMode(next)
  }

  return { viewMode, handleViewModeChange }
}
