const LEGACY_PLACEHOLDERS = new Set(["blank", "string"])

type ApiRecord = Record<string, unknown>

const asRecord = (value: unknown): ApiRecord | null =>
  value && typeof value === "object" ? value as ApiRecord : null

export const normalizeApiText = (value: unknown): string => {
  if (typeof value !== "string") return ""

  const normalized = value.trim()
  if (!normalized || LEGACY_PLACEHOLDERS.has(normalized.toLowerCase())) return ""

  return normalized
}

export const getNamedValue = (value: unknown): string => {
  if (typeof value === "string") return normalizeApiText(value)
  if (!value || typeof value !== "object") return ""

  const record = value as Record<string, unknown>
  return normalizeApiText(record.nombre ?? record.name ?? record.descripcion)
}

export const getEvaluacionDate = (apiData: ApiRecord): string => {
  const latestEvaluacion = asRecord(apiData.latest_evaluacion)
  const value = normalizeApiText(latestEvaluacion?.fecha_y_hora)
  return value ? value.slice(0, 10) : ""
}

export const getOficioClassification = (apiData: ApiRecord) => {
  const tipoOficio = apiData.tipo_oficio_detalle ?? apiData.tipo_oficio
  const tipoRecord = tipoOficio && typeof tipoOficio === "object"
    ? tipoOficio as Record<string, unknown>
    : null
  const categoria =
    apiData.categoria_oficio_detalle ??
    apiData.categoria_oficio ??
    apiData.categoria ??
    tipoRecord?.categoria

  return {
    categoriaOficio: getNamedValue(categoria),
    tipoOficio: getNamedValue(tipoOficio),
  }
}

export const getDemandInstitution = (apiData: ApiRecord) => {
  const isCargaOficios = apiData.objetivo_de_demanda === "CARGA_OFICIOS"

  if (isCargaOficios) {
    return {
      tipoInstitucion: getNamedValue(apiData.bloque_datos_remitente),
      institucion: getNamedValue(apiData.tipo_institucion),
    }
  }

  return {
    tipoInstitucion: getNamedValue(apiData.tipo_institucion),
    institucion: getNamedValue(apiData.institucion),
  }
}

export const mapEvaluacionActividad = (actividad: ApiRecord) => ({
  FechaHora: normalizeApiText(actividad.fecha_y_hora_manual ?? actividad.fecha_y_hora),
  TipoActividad:
    getNamedValue(actividad.tipo_actividad_detalle ?? actividad.tipo_actividad ?? actividad.tipo) ||
    "Sin tipo registrado",
  Institucion: getNamedValue(actividad.institucion) || "Sin institución registrada",
  Descripcion: normalizeApiText(actividad.descripcion),
  by_user: actividad.by_user ?? null,
  adjuntos: Array.isArray(actividad.adjuntos) ? actividad.adjuntos : [],
  fecha_y_hora_manual: normalizeApiText(actividad.fecha_y_hora_manual),
  id: actividad.id,
  demanda: actividad.demanda,
})
