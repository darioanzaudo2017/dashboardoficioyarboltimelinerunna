// ============================================================================
// TYPES
// ============================================================================

export interface IntervencionFormData {
  // Identificadores
  medida: number

  // Información básica
  fecha_intervencion: string // YYYY-MM-DD

  // Tipo de dispositivo (opcional)
  tipo_dispositivo_id?: number | null
  subtipo_dispositivo_id?: number | null

  // Tipo de cese (solo para etapa CESE)
  tipo_cese?: string | null
  subtipo_cese?: string | null

  // Motivo y submotivo
  motivo_id?: number
  sub_motivo_id?: number | null

  // Categoría e intervención
  categoria_intervencion_id?: number
  intervencion_especifica: string

  // Descripciones
  descripcion_detallada: string
  motivo_vulneraciones: string

  // Configuración
  requiere_informes_ampliatorios: boolean
}

export interface UseRegistroIntervencionOptions {
  medidaId: number
  intervencionId?: number // Si se pasa, carga la intervención existente
  autoLoadCatalogs?: boolean // Si true, carga catálogos automáticamente
  workflowPhase?: 'apertura' | 'innovacion' | 'prorroga' | 'cese'
  tipoMedida?: 'MPI' | 'MPE' | 'MPJ'
}

export interface ValidationErrors {
  [key: string]: string
}
