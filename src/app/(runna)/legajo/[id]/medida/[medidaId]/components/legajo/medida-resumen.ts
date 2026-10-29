/**
 * Resumen de una medida para el legajo: cuántas actividades hay en cada estado, qué hizo cada equipo,
 * cuál fue la última actividad realizada y cuál es la próxima. Solo cálculos (sin llamadas al servidor).
 */

export interface ActividadParaResumen {
  estado: string
  actor?: string | null
  fecha_planificacion?: string | null
  fecha_finalizacion_real?: string | null
  esta_vencida?: boolean | null
  subtipo_actividad_info?: { nombre?: string | null } | null
  tipo_actividad_info?: { nombre?: string | null } | null
  subactividad?: string | null
}

export interface ActividadDestacada {
  fecha: string
  titulo: string
  actor: string | null
}

/**
 * Mismos criterios que el tablero del Plan de Trabajo (para que los números coincidan):
 * - `pendientes` son todas las que están en estado PENDIENTE, incluidas las vencidas;
 * - `vencidas` son las pendientes con la fecha pasada (o con estado VENCIDA);
 * - `avance` es realizadas sobre el total, sin descontar canceladas.
 * `pendientesEnPlazo` sirve para dibujar la barra: cada actividad cae en un solo tramo.
 */
export interface ResumenActividades {
  total: number
  realizadas: number
  porVisar: number
  enProgreso: number
  pendientes: number
  pendientesEnPlazo: number
  vencidas: number
  canceladas: number
  /** Porcentaje de realizadas sobre el total (0 si no hay ninguna). */
  avance: number
  porEquipo: Record<string, number>
  ultimaRealizada: ActividadDestacada | null
  proxima: ActividadDestacada | null
}

const ESTADOS_REALIZADA = ["COMPLETADA", "VISADO_APROBADO"]
const ESTADOS_POR_VISAR = ["PENDIENTE_VISADO_JZ", "PENDIENTE_VISADO", "VISADO_CON_OBSERVACION"]

export const NOMBRE_EQUIPO: Record<string, string> = {
  EQUIPO_TECNICO: "Técnico",
  EQUIPO_LEGAL: "Legal",
  EQUIPOS_RESIDENCIALES: "Residencial",
  ADULTOS_INSTITUCION: "Adultos / Institución",
}

const tituloDe = (a: ActividadParaResumen): string =>
  a.subtipo_actividad_info?.nombre || a.tipo_actividad_info?.nombre || a.subactividad || "Actividad"

const fechaDe = (iso: string | null | undefined): number => {
  const t = iso ? new Date(iso).getTime() : Number.NaN
  return Number.isNaN(t) ? Number.NaN : t
}

const destacada = (a: ActividadParaResumen, fecha: string): ActividadDestacada => ({
  fecha,
  titulo: tituloDe(a),
  actor: a.actor ? (NOMBRE_EQUIPO[a.actor] ?? a.actor) : null,
})

export const resumirActividades = (actividades: ActividadParaResumen[], hoy: Date = new Date()): ResumenActividades => {
  const resumen: ResumenActividades = {
    total: actividades.length,
    realizadas: 0,
    porVisar: 0,
    enProgreso: 0,
    pendientes: 0,
    pendientesEnPlazo: 0,
    vencidas: 0,
    canceladas: 0,
    avance: 0,
    porEquipo: {},
    ultimaRealizada: null,
    proxima: null,
  }

  let ultima: { t: number; a: ActividadParaResumen; fecha: string } | null = null
  let proxima: { t: number; a: ActividadParaResumen; fecha: string } | null = null
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()

  for (const a of actividades) {
    const nombreEquipo = a.actor ? (NOMBRE_EQUIPO[a.actor] ?? a.actor) : null
    if (nombreEquipo) resumen.porEquipo[nombreEquipo] = (resumen.porEquipo[nombreEquipo] ?? 0) + 1

    if (a.estado === "CANCELADA") {
      resumen.canceladas++
    } else if (ESTADOS_REALIZADA.includes(a.estado)) {
      resumen.realizadas++
      const fecha = a.fecha_finalizacion_real ?? a.fecha_planificacion ?? null
      const t = fechaDe(fecha)
      if (fecha && !Number.isNaN(t) && (!ultima || t > ultima.t)) ultima = { t, a, fecha }
    } else if (ESTADOS_POR_VISAR.includes(a.estado)) {
      resumen.porVisar++
    } else if (a.estado === "VENCIDA") {
      resumen.vencidas++
    } else if (a.estado === "EN_PROGRESO") {
      resumen.enProgreso++
    } else {
      resumen.pendientes++
      if (a.esta_vencida) resumen.vencidas++
      else resumen.pendientesEnPlazo++
    }

    // La próxima actividad es la planificada más cercana (desde hoy) entre las que todavía no se hicieron ni vencieron.
    const abierta = a.estado === "PENDIENTE" || a.estado === "EN_PROGRESO"
    if (abierta && !a.esta_vencida && a.fecha_planificacion) {
      const t = fechaDe(a.fecha_planificacion)
      if (!Number.isNaN(t) && t >= inicioHoy && (!proxima || t < proxima.t)) proxima = { t, a, fecha: a.fecha_planificacion }
    }
  }

  resumen.avance = resumen.total > 0 ? Math.round((resumen.realizadas / resumen.total) * 100) : 0
  if (ultima) resumen.ultimaRealizada = destacada(ultima.a, ultima.fecha)
  if (proxima) resumen.proxima = destacada(proxima.a, proxima.fecha)
  return resumen
}

export interface MedidaParaAlerta {
  id: number
  numero_medida?: string | null
  tipo_medida?: string | { display?: string; nombre?: string } | null
  estado_vigencia?: string | null
}

const textoTipo = (tipo: MedidaParaAlerta["tipo_medida"]): string =>
  typeof tipo === "string" ? tipo : (tipo?.display ?? tipo?.nombre ?? "")

/** Números de las OTRAS medidas vigentes del mismo tipo que `medida` (vacío si esta no es vigente o está sola). */
export const otrasVigentesDelMismoTipo = (medida: MedidaParaAlerta, todas: MedidaParaAlerta[]): string[] => {
  if (medida.estado_vigencia !== "VIGENTE") return []
  const tipo = textoTipo(medida.tipo_medida)
  if (!tipo) return []
  return todas
    .filter((m) => m.id !== medida.id && m.estado_vigencia === "VIGENTE" && textoTipo(m.tipo_medida) === tipo)
    .map((m) => m.numero_medida ?? `#${m.id}`)
}
