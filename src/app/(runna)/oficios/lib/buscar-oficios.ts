import type { MedidaAllItem } from "../../indicadores/types"
import type { DemandaAllItem } from "../types"
import type { TActividadPlanTrabajo } from "../../legajo/[id]/medida/[medidaId]/types/actividades"

/**
 * Estados de actividad considerados "terminales" para decidir si un oficio
 * está contestado. VISADO_APROBADO cubre el circuito con visado legal;
 * CANCELADA cuenta como resuelta (ya no bloquea nada pendiente) — acordado
 * con el usuario. PENDIENTE_VISADO / PENDIENTE_VISADO_JZ / VISADO_CON_OBSERVACION
 * y VENCIDA quedan afuera a propósito: todavía requieren acción.
 */
export const ESTADOS_TERMINALES = new Set(["COMPLETADA", "VISADO_APROBADO", "CANCELADA"])

export interface OficioEncontrado {
  oficioId: number
  objetivo: string
  actividades: TActividadPlanTrabajo[]
  contestado: boolean
  /** Cantidad de actividades en estado terminal, para la barra de avance. */
  actividadesCompletas: number
  actividadesTotal: number
  /** Identificadores reales del oficio, sacados de la demanda (oficio_origen.numero SIEMPRE viene null, no sirve). */
  numeroExpediente: string | null
  nroOficioWeb: string | null
  nroSacDemanda: string | number | null
}

export interface MedidaConOficios {
  medida: MedidaAllItem
  oficios: OficioEncontrado[]
}

const contieneTexto = (valor: string | number | null | undefined, query: string): boolean =>
  valor !== null && valor !== undefined && String(valor).toLowerCase().includes(query)

/**
 * Agrupa TODAS las actividades de TODAS las medidas por oficio de origen
 * (`oficio_origen.id`, que es el id de la demanda-oficio), enriqueciendo cada
 * grupo con los identificadores reales sacados de `demandasAll` — no de
 * `oficio_origen.numero`, que viene siempre vacío.
 */
export function armarMedidasConOficios(
  medidas: MedidaAllItem[],
  demandas: DemandaAllItem[]
): MedidaConOficios[] {
  const demandaPorId = new Map<number, DemandaAllItem>()
  for (const d of demandas) demandaPorId.set(d.id, d)

  return medidas.map((medida) => {
    const actividades = medida.plan_trabajo?.actividades ?? []
    const porOficio = new Map<number, TActividadPlanTrabajo[]>()

    for (const actividad of actividades) {
      if (!actividad.oficio_origen) continue
      const lista = porOficio.get(actividad.oficio_origen.id) ?? []
      lista.push(actividad)
      porOficio.set(actividad.oficio_origen.id, lista)
    }

    const oficios: OficioEncontrado[] = Array.from(porOficio.entries()).map(([oficioId, acts]) => {
      const demanda = demandaPorId.get(oficioId)
      const completas = acts.filter((a) => ESTADOS_TERMINALES.has(a.estado)).length
      return {
        oficioId,
        objetivo: demanda?.objetivo_de_demanda ?? acts[0]?.oficio_origen?.objetivo ?? "Sin dato",
        actividades: acts,
        contestado: acts.length > 0 && completas === acts.length,
        actividadesCompletas: completas,
        actividadesTotal: acts.length,
        numeroExpediente: demanda?.numero_expediente ?? null,
        nroOficioWeb: demanda?.nro_oficio_web ?? null,
        nroSacDemanda: demanda?.nro_sac ?? null,
      }
    })

    return { medida, oficios }
  })
}

/**
 * Filtra medidas-con-oficios por un identificador buscado a mano: SAC/número
 * de medida/legajo (lado medida) O SAC/expediente/oficio-web de cualquiera
 * de sus oficios vinculados (lado demanda) — los dos lados NO están
 * sincronizados entre sí, así que hay que probar ambos.
 */
export function buscarPorIdentificador(medidasConOficios: MedidaConOficios[], query: string): MedidaConOficios[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return medidasConOficios.filter(({ medida, oficios }) => {
    const matchMedida =
      contieneTexto(medida.nro_sac, q) ||
      contieneTexto(medida.numero_medida, q) ||
      contieneTexto(medida.legajo?.numero, q)

    const matchOficio = oficios.some(
      (o) =>
        contieneTexto(o.numeroExpediente, q) ||
        contieneTexto(o.nroOficioWeb, q) ||
        contieneTexto(o.nroSacDemanda, q)
    )

    return matchMedida || matchOficio
  })
}

export const OBJETIVO_LABELS: Record<string, string> = {
  CARGA_OFICIOS: "Carga de Oficios",
  PETICION_DE_INFORME: "Petición de Informe",
  PROTECCION: "Protección",
}
