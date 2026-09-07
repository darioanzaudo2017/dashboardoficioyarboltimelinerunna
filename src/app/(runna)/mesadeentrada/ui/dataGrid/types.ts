import type { TDemanda } from "@/app/interfaces"

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type TDemandaPaginated = PaginatedResponse<TDemanda>

// Define a type for adjuntos to help with debugging
export interface Adjunto {
  archivo: string
}

export type PresetKey = "pendientes" | "sin_asignar" | "con_alertas" | "completa"

export type ViewMode = "list" | "tabla"

/** Shape que `Buttons` emite por `onFilterChange` y que el grid traduce a query params. */
export interface DemandaFilterState {
  envio_de_respuesta: "NO_NECESARIO" | "PENDIENTE" | "ENVIADO" | null
  estado_demanda:
    | "SIN_ASIGNAR"
    | "CONSTATACION"
    | "EVALUACION"
    | "PENDIENTE_AUTORIZACION"
    | "ARCHIVADA"
    | "ADMITIDA"
    | null
  objetivo_de_demanda: "CONSTATACION" | "PETICION_DE_INFORME" | null
}

/** Filtros efectivamente enviados al backend (incluye la búsqueda inline). */
export interface DemandaApiFilters extends DemandaFilterState {
  search: string | null
}
