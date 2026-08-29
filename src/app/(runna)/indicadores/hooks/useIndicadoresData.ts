"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getMedidasAll } from "../api/indicadores-api-service"
import { enriquecerMedidas } from "../lib/enriquecer"
import type { MedidaEnriquecida } from "../lib/enriquecer"

export interface PeriodoFiltro {
  desde?: string // YYYY-MM-DD
  hasta?: string // YYYY-MM-DD
}

export function useIndicadoresData(periodo: PeriodoFiltro) {
  const medidasQuery = useQuery({
    queryKey: ["indicadores-medidas-all"],
    queryFn: getMedidasAll,
    staleTime: 1000 * 60 * 5,
  })

  const todas = useMemo(() => {
    if (!medidasQuery.data) return []
    return enriquecerMedidas(medidasQuery.data)
  }, [medidasQuery.data])

  // El "período" filtra por fecha de apertura de la medida. Se aplica acá
  // (no en el backend) porque medidas-all no soporta filtro server-side
  // confirmado desde el frontend.
  const medidas = useMemo(() => {
    if (!periodo.desde && !periodo.hasta) return todas
    return todas.filter((m) => {
      // Los inputs entregan YYYY-MM-DD, mientras que fechaApertura incluye
      // hora. Comparar el ISO completo hacía que el límite "hasta" excluyera
      // todas las medidas abiertas durante ese mismo día.
      const fechaApertura = m.fechaApertura.slice(0, 10)
      if (periodo.desde && fechaApertura < periodo.desde) return false
      if (periodo.hasta && fechaApertura > periodo.hasta) return false
      return true
    })
  }, [todas, periodo.desde, periodo.hasta])

  return {
    isLoading: medidasQuery.isLoading,
    error: medidasQuery.error ?? null,
    medidas,
    /** Sin filtro de período — para gráficos de evolución histórica (ver LineaVigentes). */
    todas,
    totalSinFiltro: todas.length,
  }
}

export type { MedidaEnriquecida }
