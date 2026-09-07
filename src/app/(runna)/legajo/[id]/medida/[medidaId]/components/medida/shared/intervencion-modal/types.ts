import type { useRegistroIntervencion } from "../../../../hooks/useRegistroIntervencion"

// ============================================================================
// TYPES
// ============================================================================

export interface IntervencionModalProps {
    open: boolean
    onClose: () => void
    medidaId?: number // Made optional with validation
    intervencionId?: number // If editing existing intervención
    legajoData?: {
        numero: string
        persona_nombre: string
        persona_apellido: string
        zona_nombre: string
        origen_demanda?: string
        tecnico_cargo?: string
    }
    tipoMedida?: 'MPI' | 'MPE' | 'MPJ' // NEW: For dynamic title and behavior
    workflowPhase?: 'apertura' | 'innovacion' | 'prorroga' | 'cese' // NEW: For MPE/MPJ tabs
    onSaved?: () => void // Callback after successful save
}

/** Valor devuelto por el hook de negocio, preservado tal cual. */
export type RegistroIntervencion = ReturnType<typeof useRegistroIntervencion>

export interface SnackbarState {
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info'
}
