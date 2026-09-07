"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { VIEW_MODE_STORAGE_KEY } from "../constants"
import type { ViewMode } from "../types"

/** Modo de vista (lista de tarjetas vs. tabla), persistido en localStorage. */
export const useViewMode = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list"
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY) as ViewMode | null
    return stored === "list" || stored === "tabla" ? stored : "list"
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
    } catch {
      /* ignore */
    }
  }, [viewMode])

  const handleViewModeChange = (_e: React.MouseEvent<HTMLElement>, next: ViewMode | null) => {
    if (next) setViewMode(next)
  }

  return { viewMode, handleViewModeChange }
}
