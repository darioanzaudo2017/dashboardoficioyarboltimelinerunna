"use client"

import type React from "react"
import { UnifiedActividadesTable } from "@/app/(runna)/legajo/actividades/components/UnifiedActividadesTable"

interface PlanTrabajoTabProps {
  medidaData: any
  planTrabajoId: number
  filterEtapa?: "APERTURA" | "PROCESO" | "CESE"
  /** Oculta contadores y progreso (la vista nueva ya los muestra arriba) */
  hideStatistics?: boolean
}

export const PlanTrabajoTab: React.FC<PlanTrabajoTabProps> = ({ medidaData, planTrabajoId, filterEtapa, hideStatistics }) => {
  return (
    <UnifiedActividadesTable
      variant="medida"
      planTrabajoId={planTrabajoId}
      medidaData={medidaData}
      filterEtapa={filterEtapa}
      excludeActors={['EQUIPO_LEGAL']}
      showWrapper={false}
      hideStatistics={hideStatistics}
    />
  )
}
