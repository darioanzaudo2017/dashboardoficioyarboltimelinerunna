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
  fecha_nacimiento: string | null
  genero: string | null
  nacionalidad: string | null
  situacion_dni: string | null
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

export interface MedidaAllDemandaOrigen {
  id: number
  numero: string | null
  nro_sac: string | number | null
  numero_expediente: string | null
  nro_oficio_web: string | null
  objetivo: string | null
  origen_id: number | null
  origen: string | null
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
  fecha_cese_efectivo: string | null
  /** Calculado por backend en días calendario y nunca negativo. */
  duracion_dias: number
  juzgado: MedidaAllCatalogoRef | null
  urgencia: (MedidaAllCatalogoRef & { peso?: number | null }) | null
  legajo: MedidaAllLegajo | null
  intervencion: MedidaAllIntervencion | null
  fecha_creacion: string
  /** SAC/identificador judicial de la medida; los vínculos nuevos lo sincronizan desde el oficio. */
  nro_sac: string | number | null
  demandas_origen: MedidaAllDemandaOrigen[]
  tipo_cese: string | null
  tipo_cese_display: string | null
  subtipo_cese: string | null
  /** Plan de trabajo con TODAS sus actividades embebidas (incluye `oficio_origen` por actividad). */
  plan_trabajo: { id: number; actividades: TActividadPlanTrabajo[] } | null
}
