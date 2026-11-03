/** Mensaje de éxito al guardar una demanda; en un oficio de MPE/MPI vigente dice qué pasó con las actividades. */

interface MedidaActivaLike {
  id: number
  numero_medida: string
}

interface DemandaGuardadaLike {
  objetivo_de_demanda?: string | null
  tipo_oficio?: unknown
  vinculos?: Array<{
    medida?: number | null
    legajo_info?: { medidas_activas?: MedidaActivaLike[] }
  }>
}

export const mensajeDemandaGuardada = (data: DemandaGuardadaLike, esEdicion: boolean): string => {
  const base = esEdicion ? "Demanda actualizada con éxito" : "Demanda creada con éxito"
  if (data.objetivo_de_demanda !== "PETICION_DE_INFORME") return base

  const vinculoConMedida = (data.vinculos ?? []).find((vinculo) => vinculo.medida)
  if (!vinculoConMedida) return base

  const medida = vinculoConMedida.legajo_info?.medidas_activas?.find((m) => m.id === vinculoConMedida.medida)
  const donde = medida ? `al plan de trabajo de ${medida.numero_medida}` : "al plan de trabajo de la medida vinculada"

  return data.tipo_oficio
    ? `${base}. Las actividades del oficio se agregan ${donde}.`
    : `${base}. No se agregaron actividades: falta elegir el Tipo de Oficio.`
}
