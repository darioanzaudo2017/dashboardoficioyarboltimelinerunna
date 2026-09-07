import { institutionalColors } from '@/theme/colors'

// Estado options for multi-select
export const ESTADO_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente', color: '#ff9800' },
  { value: 'EN_PROGRESO', label: 'En Progreso', color: '#2196f3' },
  { value: 'COMPLETADA', label: 'Completada', color: '#4caf50' },
  { value: 'PENDIENTE_VISADO_JZ', label: 'Pendiente Visado JZ', color: '#f57c00' },
  { value: 'PENDIENTE_VISADO', label: 'Pendiente Visado Legal', color: '#9c27b0' },
  { value: 'VISADO_CON_OBSERVACION', label: 'Visado con Observación', color: '#ff5722' },
  { value: 'VISADO_APROBADO', label: 'Visado Aprobado', color: institutionalColors.azulMedio },
  { value: 'CANCELADA', label: 'Cancelada', color: '#f44336' },
  { value: 'VENCIDA', label: 'Vencida', color: '#9e9e9e' },
]

// Tipo Medida options
export const TIPO_MEDIDA_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'MPI', label: 'MPI - Medida de Protección Integral' },
  { value: 'MPE', label: 'MPE - Medida de Protección Excepcional' },
  { value: 'MPJ', label: 'MPJ - Medida Penal Juvenil' },
]

// Origen options
export const ORIGEN_OPTIONS = [
  { value: '', label: 'Todos los orígenes' },
  { value: 'MANUAL', label: 'Creación Manual' },
  { value: 'DEMANDA_PI', label: 'Demanda - Petición de Informe' },
  { value: 'DEMANDA_OFICIO', label: 'Demanda - Carga de Oficios' },
  { value: 'OFICIO', label: 'Oficio Judicial' },
  { value: 'AUTO_RECURSIVA', label: 'Automática Recursiva' },
]

// Actor options
export const ACTOR_OPTIONS = [
  { value: '', label: 'Todos los equipos' },
  { value: 'EQUIPO_TECNICO', label: 'Equipo Técnico' },
  { value: 'EQUIPO_LEGAL', label: 'Equipo Legal' },
  { value: 'EQUIPOS_RESIDENCIALES', label: 'Equipos Residenciales' },
  { value: 'ADULTOS_INSTITUCION', label: 'Adultos/Institución' },
]
