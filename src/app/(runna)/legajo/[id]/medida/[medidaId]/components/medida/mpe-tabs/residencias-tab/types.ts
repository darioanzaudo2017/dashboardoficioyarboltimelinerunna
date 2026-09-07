import type { mapEducacionFromDemanda } from "../../../../utils/seguimiento-mapper"

export interface ResidenciasTabProps {
    medidaId: number // Required for API calls
    demandaData?: Parameters<typeof mapEducacionFromDemanda>[0] // Full demanda data from the full-detail endpoint
    personaId?: number // Optional specific persona ID to use
}
