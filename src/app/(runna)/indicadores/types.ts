/**
 * Tipos para los endpoints "bulk" descubiertos para armar los indicadores
 * SPPD (IP1-IP27): `GET /medidas-all/` y `GET /persona/`. Ninguno de los dos
 * tenía wrapper en el frontend todavía — se investigaron pegándole
 * directamente al backend real. Solo se tipan los campos que efectivamente
 * se usan; el resto de cada respuesta se ignora.
 *
 * También reusado por la búsqueda de Oficios (`src/app/(runna)/oficios/`):
 * `medidas-all` trae `nro_sac` y el plan de trabajo completo con sus
 * actividades anidado, que es la fuente de datos de esa página también —
 * ver `nro_sac` y `plan_trabajo` más abajo.
 */
import type { TActividadPlanTrabajo } from "../legajo/[id]/medida/[medidaId]/types/actividades"

export type TipoMedidaCodigo = "MPI" | "MPE" | "MPJ"
export type EstadoVigenciaMedida = "VIGENTE" | "CERRADA" | "ARCHIVADA" | "NO_RATIFICADA"

export interface MedidaAllNnya {
  id: number
  nombre: string
  apellido: string
  dni: number | null
  /** Edad ya calculada por el backend, presumiblemente "a hoy". */
  edad_calculada: number | null
}

export interface MedidaAllLegajo {
  id: number
  numero: string
  nnya: MedidaAllNnya | null
  zona_actual: { id: number; nombre: string } | null
}

export interface MedidaAllCatalogoRef {
  id: number
  nombre: string
}

export interface MedidaAllIntervencion {
  id: number
  estado: string
  fecha_intervencion: string
  tipo_dispositivo_detalle: MedidaAllCatalogoRef | null
  subtipo_dispositivo_detalle: (MedidaAllCatalogoRef & { capacidad_maxima?: number | null }) | null
  motivo_detalle: MedidaAllCatalogoRef | null
  sub_motivo_detalle: MedidaAllCatalogoRef | null
  categoria_intervencion_detalle: MedidaAllCatalogoRef | null
  fecha_creacion: string
}

/** Item de `GET /medidas-all/` — array plano, sin paginar. */
export interface MedidaAllItem {
  id: number
  numero_medida: string
  tipo_medida: TipoMedidaCodigo
  tipo_medida_display: string
  estado_vigencia: EstadoVigenciaMedida
  estado_vigencia_display: string
  fecha_apertura: string
  fecha_cierre: string | null
  /**
   * Calculado por backend. Para medidas vigentes se recalcula "a hoy" cada
   * vez (confirmado empíricamente). Puede dar valores negativos en aperturas
   * y cierres el mismo día (bug de redondeo de fechas del backend) — se
   * clampea a 0 al derivar los datos, ver `lib/enriquecer.ts`.
   */
  duracion_dias: number
  juzgado: string | null
  urgencia: string | null
  legajo: MedidaAllLegajo | null
  intervencion: MedidaAllIntervencion | null
  fecha_creacion: string
  /** SAC de la medida (distinto del SAC/expediente que pueda tener la demanda que la originó — no están garantizados a coincidir). */
  nro_sac: string | number | null
  /** Plan de trabajo con TODAS sus actividades embebidas (incluye `oficio_origen` por actividad). */
  plan_trabajo: { id: number; actividades: TActividadPlanTrabajo[] } | null
}

/** Item de `GET /persona/` — array plano, sin paginar (295 personas en la muestra). */
export interface PersonaAllItem {
  id: number
  nombre: string
  apellido: string
  fecha_nacimiento: string | null
  nacionalidad: string | null
  dni: number | null
  /** VALIDO | EN_TRAMITE | VENCIDO | EXTRAVIADO | INEXISTENTE | OTRO (no confirmado exhaustivamente). */
  situacion_dni: string | null
  genero: string | null
  /** true si esta persona es el NNyA de un legajo (no un adulto relacionado). */
  nnya: boolean
}
