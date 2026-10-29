/**
 * Chequeo previo a pedir/autorizar una medida: ¿el NNyA ya tiene legajo? ¿tiene medidas vigentes?
 *
 * El backend resuelve el legajo por persona (no por DNI) y no mira si ya hay una medida vigente, así
 * que el front lo muestra en la confirmación para que quien decide lo vea antes de crear nada.
 * Acá está solo la parte que arma los mensajes (sin llamadas al servidor) para poder probarla.
 */

export interface PersonaAEvaluar {
  id?: number | string | null
  nombre: string
  dni?: number | string | null
}

export interface PersonaEncontrada {
  id: number | string
  dni?: number | string | null
  legajo?: { id: number; numero: string } | null
}

export interface MedidaVigente {
  id: number
  numero_medida?: string | null
  tipo_medida?: string | null
}

export type MedidasPorLegajo = Record<number, MedidaVigente[]>

const normalizarDni = (dni: number | string | null | undefined): string => String(dni ?? "").trim()

/** Registros de la búsqueda por DNI que corresponden al mismo documento que la persona evaluada. */
export const personasConMismoDni = (persona: PersonaAEvaluar, encontradas: PersonaEncontrada[]): PersonaEncontrada[] => {
  const dni = normalizarDni(persona.dni)
  if (!dni) return []
  return encontradas.filter((p) => normalizarDni(p.dni) === dni)
}

const describirMedidas = (legajoId: number, medidasPorLegajo: MedidasPorLegajo): string => {
  const medidas = medidasPorLegajo[legajoId] ?? []
  if (medidas.length === 0) return ""
  const detalle = medidas.map((m) => `${m.numero_medida ?? `#${m.id}`}${m.tipo_medida ? ` (${m.tipo_medida})` : ""}`).join(", ")
  return ` con ${medidas.length === 1 ? "1 medida vigente" : `${medidas.length} medidas vigentes`}: ${detalle}`
}

/** Mensajes para el Director/técnico. Lista vacía = no se encontró nada que revisar. */
export const describirHallazgos = (
  persona: PersonaAEvaluar,
  encontradas: PersonaEncontrada[],
  medidasPorLegajo: MedidasPorLegajo,
): string[] => {
  const dni = normalizarDni(persona.dni)
  if (!dni) {
    return [
      `${persona.nombre}: no tiene DNI cargado, así que no se pudo comprobar si ya tiene legajo o medidas. Buscalo a mano en la bandeja de legajos.`,
    ]
  }

  const mismos = personasConMismoDni(persona, encontradas)
  const propio = mismos.find((p) => String(p.id) === String(persona.id))
  const otros = mismos.filter((p) => String(p.id) !== String(persona.id))
  const lineas: string[] = []

  if (propio?.legajo) {
    lineas.push(`${persona.nombre} ya tiene el legajo ${propio.legajo.numero}${describirMedidas(propio.legajo.id, medidasPorLegajo)}.`)
  }

  otros.forEach((otro) => {
    if (otro.legajo) {
      lineas.push(
        `${persona.nombre}: hay otro registro con el mismo DNI (${dni}) que ya tiene el legajo ${otro.legajo.numero}${describirMedidas(otro.legajo.id, medidasPorLegajo)}. Si es la misma persona, conviene vincular la demanda a ese legajo para no duplicarlo.`,
      )
    } else {
      lineas.push(`${persona.nombre}: hay otro registro cargado con el mismo DNI (${dni}) y sin legajo. Puede ser una persona duplicada.`)
    }
  })

  return lineas
}
