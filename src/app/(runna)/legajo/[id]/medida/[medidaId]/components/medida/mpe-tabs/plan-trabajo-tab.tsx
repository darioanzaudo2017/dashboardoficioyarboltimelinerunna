"use client"

import type React from "react"
import { UnifiedActividadesTable } from "@/app/(runna)/legajo/actividades/components/UnifiedActividadesTable"

interface PlanTrabajoTabProps {
  medidaData: any
  planTrabajoId: number
  filterEtapa?: "APERTURA" | "PROCESO" | "CESE"
  /** Oculta contadores y progreso (la vista nueva ya los muestra arriba) */
  hideStatistics?: boolean
  /** Incluye también las actividades del Equipo Legal (en MPJ el plan muestra todas; en MPI/MPE van al control de legalidad). */
  incluirLegales?: boolean
}

export const PlanTrabajoTab: React.FC<PlanTrabajoTabProps> = ({
  medidaData,
  planTrabajoId,
  filterEtapa,
  hideStatistics,
  incluirLegales = false,
}) => {
  return (
    <UnifiedActividadesTable
      variant="medida"
      planTrabajoId={planTrabajoId}
      medidaData={medidaData}
      filterEtapa={filterEtapa}
      excludeActors={incluirLegales ? undefined : ['EQUIPO_LEGAL']}
      showWrapper={false}
      hideStatistics={hideStatistics}
    />
  )
}
