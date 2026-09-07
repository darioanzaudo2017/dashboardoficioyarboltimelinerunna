import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

export interface PersonaDetailModalProps {
  open: boolean
  onClose: () => void
  legajoData: LegajoDetailResponse
  readOnly?: boolean
  onEdit?: (section: "personal" | "location" | "legajo") => void
}

export interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

// Form state interface for inline editing
export interface PersonaFormState {
  // Personal info
  nombre: string
  nombre_autopercibido: string
  apellido: string
  fecha_nacimiento: string
  edad_aproximada: string
  nacionalidad: string
  dni: string
  situacion_dni: string
  genero: string
  telefono: string
  observaciones: string
  // Location - FKs are numbers, strings for text fields
  calle: string
  numero: string
  piso: string
  departamento: string
  barrio: number | null // FK
  localidad: number | null // FK
  cpc: number | null // FK
  referencia_geo: string
  mza: string // Will be converted to number on save
  lote: string // Will be converted to number on save
  // Education - FK for institucion, enum keys for choices
  institucion_educativa: number | null // FK
  nivel_alcanzado: string // Enum key
  esta_escolarizado: boolean
  ultimo_cursado: string // Enum key
  tipo_escuela: string // Enum key
  comentarios_educativos: string
  // Health - FK for institucion and medico, enum keys for choices
  institucion_sanitaria: number | null // FK
  obra_social: string // Enum key
  intervencion: string // Enum key
  auh: boolean
  medico_cabecera: number | null // FK to TMedico
  // Display-only fields for medico (read from API, not sent back)
  medico_nombre: string
  medico_mail: string
  medico_telefono: string
  observaciones_medicas: string
  // Vulnerability
  condiciones_vulnerabilidad: number[]
}

export type PersonaData = LegajoDetailResponse["persona"]
export type LegajoData = LegajoDetailResponse["legajo"]
export type PermisosUsuario = LegajoDetailResponse["permisos_usuario"]
export type AsignacionesActivas = LegajoDetailResponse["asignaciones_activas"]
export type MedidasActivas = LegajoDetailResponse["medidas_activas"]
export type DemandasRelacionadas = LegajoDetailResponse["demandas_relacionadas"]
