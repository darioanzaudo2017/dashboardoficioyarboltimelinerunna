"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getMedidasAll, getPersonasAll } from "../api/indicadores-api-service"
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

  const personasQuery = useQuery({
    queryKey: ["indicadores-personas-all"],
    queryFn: getPersonasAll,
    staleTime: 1000 * 60 * 5,
  })

  const todas = useMemo(() => {
    if (!medidasQuery.data || !personasQuery.data) return []
    return enriquecerMedidas(medidasQuery.data, personasQuery.data)
  }, [medidasQuery.data, personasQuery.data])

  // El "período" filtra por fecha de apertura de la medida. Se aplica acá
  // (no en el backend) porque medidas-all no soporta filtro server-side
  // confirmado desde el frontend.
  const medidas = useMemo(() => {
    if (!periodo.desde && !periodo.hasta) return todas
    return todas.filter((m) => {
      if (periodo.desde && m.fechaApertura < periodo.desde) return false
      if (periodo.hasta && m.fechaApertura > periodo.hasta) return false
      return true
    })
  }, [todas, periodo.desde, periodo.hasta])

  return {
    isLoading: medidasQuery.isLoading || personasQuery.isLoading,
    error: medidasQuery.error ?? personasQuery.error ?? null,
    medidas,
    /** Sin filtro de período — para gráficos de evolución histórica (ver LineaVigentes). */
    todas,
    totalSinFiltro: todas.length,
  }
}

export type { MedidaEnriquecida }
