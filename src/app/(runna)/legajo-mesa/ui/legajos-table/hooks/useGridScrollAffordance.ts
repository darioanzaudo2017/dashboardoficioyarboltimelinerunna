"use client"

import { useState, useEffect, useRef } from "react"
import type { GridColDef } from "@mui/x-data-grid"

/**
 * Afordancia de scroll horizontal del DataGrid de legajos: observa el virtual
 * scroller para saber si se puede desplazar y expone el desplazamiento manual.
 *
 * Se invoca en el mismo punto del render donde vivía el efecto original, de modo
 * que el orden de ejecución de los `useEffect` del componente no cambia.
 */
export const useGridScrollAffordance = (showTable: boolean, columns: GridColDef[]) => {
  // Horizontal scroll affordance — see mesadeentrada for full rationale.
  const gridContainerRef = useRef<HTMLDivElement | null>(null)
  const scrollerRef = useRef<HTMLElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const scrollGridBy = (delta: number) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({ left: delta, behavior: "smooth" })
  }

  useEffect(() => {
    if (!showTable) {
      scrollerRef.current = null
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    const container = gridContainerRef.current
    if (!container) return

    let scroller: HTMLElement | null = null
    let resizeObs: ResizeObserver | null = null

    const update = () => {
      const el = scroller
      if (!el) return
      setCanScrollLeft(el.scrollLeft > 1)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }

    const attach = (el: HTMLElement) => {
      scroller = el
      scrollerRef.current = el
      update()
      el.addEventListener("scroll", update, { passive: true })
      resizeObs = new ResizeObserver(update)
      resizeObs.observe(el)
    }

    const found = container.querySelector(".MuiDataGrid-virtualScroller") as HTMLElement | null
    let mo: MutationObserver | null = null
    if (found) {
      attach(found)
    } else {
      mo = new MutationObserver(() => {
        const el = container.querySelector(".MuiDataGrid-virtualScroller") as HTMLElement | null
        if (el) {
          attach(el)
          mo?.disconnect()
          mo = null
        }
      })
      mo.observe(container, { childList: true, subtree: true })
    }

    return () => {
      if (scroller) scroller.removeEventListener("scroll", update)
      resizeObs?.disconnect()
      mo?.disconnect()
      scrollerRef.current = null
    }
  }, [showTable, columns])

  return { gridContainerRef, canScrollLeft, canScrollRight, scrollGridBy }
}
