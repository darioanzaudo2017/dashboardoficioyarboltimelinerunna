import type { MedidaAllItem, PersonaAllItem, TipoMedidaCodigo } from "../types"
import { calcularEdadEn, grupoEtario } from "./edad"

export interface MedidaEnriquecida {
  id: number
  tipoMedida: TipoMedidaCodigo
  estadoVigencia: MedidaAllItem["estado_vigencia"]
  fechaApertura: string
  mesApertura: string // "YYYY-MM"
  fechaCierre: string | null
  /** duracion_dias del backend, clampeada a 0 (ver nota en types.ts sobre el bug de -1). */
  duracionDias: number
  estaCerrada: boolean
  juzgado: MedidaAllItem["juzgado"]
  urgencia: MedidaAllItem["urgencia"]

  nnyaId: number | null
  genero: string | null
  nacionalidad: string | null
  situacionDni: string | null
  tieneDni: boolean | null // null = sin dato de persona
  edad: number | null
  grupoEtario: string

  motivoIntervencion: string | null
  categoriaIntervencion: string | null
  tipoDispositivo: string | null // "tipo de alojamiento" (MPE) / "tipo de dispositivo" (MPJ)
  subtipoDispositivo: string | null
}

export function enriquecerMedidas(
  medidas: MedidaAllItem[],
  personas: PersonaAllItem[]
): MedidaEnriquecida[] {
  const personaPorId = new Map<number, PersonaAllItem>()
  for (const p of personas) personaPorId.set(p.id, p)

  return medidas.map((m): MedidaEnriquecida => {
    const nnya = m.legajo?.nnya ?? null
    const persona = nnya ? personaPorId.get(nnya.id) ?? null : null

    const edad =
      persona?.fecha_nacimiento != null
        ? calcularEdadEn(persona.fecha_nacimiento, m.fecha_apertura)
        : nnya?.edad_calculada ?? null

    return {
      id: m.id,
      tipoMedida: m.tipo_medida,
      estadoVigencia: m.estado_vigencia,
      fechaApertura: m.fecha_apertura,
      mesApertura: m.fecha_apertura?.slice(0, 7) ?? "Sin dato",
      fechaCierre: m.fecha_cierre,
      duracionDias: Math.max(m.duracion_dias ?? 0, 0),
      estaCerrada: m.estado_vigencia === "CERRADA",
      juzgado: m.juzgado,
      urgencia: m.urgencia,

      nnyaId: nnya?.id ?? null,
      genero: persona?.genero ?? null,
      nacionalidad: persona?.nacionalidad ?? null,
      situacionDni: persona?.situacion_dni ?? null,
      tieneDni: persona ? (persona.situacion_dni ? persona.situacion_dni === "VALIDO" : persona.dni != null) : null,
      edad,
      grupoEtario: grupoEtario(edad),

      motivoIntervencion: m.intervencion?.motivo_detalle?.nombre ?? null,
      categoriaIntervencion: m.intervencion?.categoria_intervencion_detalle?.nombre ?? null,
      tipoDispositivo: m.intervencion?.tipo_dispositivo_detalle?.nombre ?? null,
      subtipoDispositivo: m.intervencion?.subtipo_dispositivo_detalle?.nombre ?? null,
    }
  })
}
