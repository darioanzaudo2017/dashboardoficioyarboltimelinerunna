"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LEGAJO_VIEW_MODE_STORAGE_KEY, type LegajoViewMode } from "../constants"

/** Modo de vista (lista de tarjetas vs. tabla), persistido en localStorage. */
export const useLegajoViewMode = () => {
  const [viewMode, setViewMode] = useState<LegajoViewMode>(() => {
    if (typeof window === "undefined") return "list"
    const stored = window.localStorage.getItem(LEGAJO_VIEW_MODE_STORAGE_KEY) as LegajoViewMode | null
    return stored === "list" || stored === "tabla" ? stored : "list"
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(LEGAJO_VIEW_MODE_STORAGE_KEY, viewMode)
    } catch {
      /* ignore */
    }
  }, [viewMode])

  const handleViewModeChange = (_e: React.MouseEvent<HTMLElement>, next: LegajoViewMode | null) => {
    if (next) setViewMode(next)
  }

  return { viewMode, handleViewModeChange }
}
