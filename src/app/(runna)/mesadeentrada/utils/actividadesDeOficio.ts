/**
 * Actividades que genera una demanda de oficio (carga de oficios o pedido de informe): el servidor las crea solas
 * y cada una trae `oficio_origen.id` con el número de la demanda. Solo cálculos, sin llamadas al servidor.
 */

/** Objetivos de demanda cuyo registro inserta actividades predeterminadas en un plan de trabajo. */
const OBJETIVOS_CON_ACTIVIDADES_DE_OFICIO = ["CARGA_OFICIOS", "PETICION_DE_INFORME"]

export const demandaGeneraActividadesDeOficio = (objetivo?: string | null): boolean =>
  !!objetivo && OBJETIVOS_CON_ACTIVIDADES_DE_OFICIO.includes(objetivo)

export interface ActividadConOrigen {
  oficio_origen?: { id: number } | null
  responsable_principal?: number | null
  responsables_secundarios?: number[] | null
  usuario_creacion?: number | null
}

/** Las actividades que salieron de la demanda `demandaId`. */
export const filtrarActividadesDeDemanda = <T extends ActividadConOrigen>(actividades: T[], demandaId: number): T[] =>
  actividades.filter((a) => a.oficio_origen?.id === demandaId)

/**
 * Cuántas actividades siguen "sin reasignar": el servidor las crea a nombre de quien cargó el oficio, así que mientras
 * el responsable principal sea esa misma persona (y no haya secundarios) nadie del equipo las tomó todavía.
 */
export const contarSinReasignar = (actividades: ActividadConOrigen[]): number =>
  actividades.filter((a) => {
    const sinSecundarios = (a.responsables_secundarios?.length ?? 0) === 0
    const sinResponsable = a.responsable_principal == null
    const aNombreDeQuienCargo = a.responsable_principal != null && a.responsable_principal === a.usuario_creacion
    return sinSecundarios && (sinResponsable || aNombreDeQuienCargo)
  }).length
