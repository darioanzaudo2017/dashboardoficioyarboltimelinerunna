import type { MedidaAllItem, TipoMedidaCodigo } from "../types"
import { calcularEdadEn, grupoEtario } from "./edad"

export interface MedidaEnriquecida {
  id: number
  /** Identificadores legibles: no se usan en los gráficos, sí en la hoja "Datos" del Excel. */
  numeroMedida: string
  numeroLegajo: string | null
  zona: string | null
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
  motivoCese: string | null
  origenDemanda: string | null
}

export function enriquecerMedidas(medidas: MedidaAllItem[]): MedidaEnriquecida[] {
  return medidas.map((m): MedidaEnriquecida => {
    const nnya = m.legajo?.nnya ?? null

    const edad =
      nnya?.fecha_nacimiento != null
        ? calcularEdadEn(nnya.fecha_nacimiento, m.fecha_apertura)
        : nnya?.edad_calculada ?? null

    return {
      id: m.id,
      numeroMedida: m.numero_medida,
      numeroLegajo: m.legajo?.numero ?? null,
      zona: m.legajo?.zona_actual?.nombre ?? null,
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
      genero: nnya?.genero ?? null,
      nacionalidad: nnya?.nacionalidad ?? null,
      situacionDni: nnya?.situacion_dni ?? null,
      tieneDni: nnya ? (nnya.situacion_dni ? nnya.situacion_dni === "VALIDO" : nnya.dni != null) : null,
      edad,
      grupoEtario: grupoEtario(edad),

      motivoIntervencion: m.intervencion?.motivo_detalle?.nombre ?? null,
      categoriaIntervencion: m.intervencion?.categoria_intervencion_detalle?.nombre ?? null,
      tipoDispositivo: m.intervencion?.tipo_dispositivo_detalle?.nombre ?? null,
      subtipoDispositivo: m.intervencion?.subtipo_dispositivo_detalle?.nombre ?? null,
      motivoCese: m.tipo_cese_display ?? m.subtipo_cese ?? m.tipo_cese ?? null,
      origenDemanda: m.demandas_origen?.[0]?.origen ?? null,
    }
  })
}
