import { getErrorMessage } from "@/utils/errorMessages"

/**
 * Traduce la respuesta de error del backend (formato DRF, anidado) a mensajes
 * legibles para quien carga el formulario.
 *
 * Ejemplo de respuesta:
 *   { personas: [{}, { persona: { telefono: ["Asegúrese de que este valor es menor o igual a 2147483647."] } }] }
 * Resultado:
 *   "Persona 2 › Teléfono: El valor es demasiado grande (máximo 2.147.483.647)."
 */

const FIELD_LABELS: Record<string, string> = {
  telefono: "Teléfono",
  dni: "DNI",
  nombre: "Nombre",
  apellido: "Apellido",
  genero: "Género",
  nacionalidad: "Nacionalidad",
  situacion_dni: "Situación DNI",
  fecha_nacimiento: "Fecha de nacimiento",
  fecha_defuncion: "Fecha de defunción",
  edad_aproximada: "Edad aproximada",
  calle: "Calle",
  casa_nro: "Altura",
  piso_depto: "Piso/Depto",
  lote: "Lote",
  mza: "Manzana",
  referencia_geo: "Referencia geográfica",
  geolocalizacion: "Geolocalización",
  localidad: "Localidad",
  barrio: "Barrio",
  cpc: "CPC",
  fecha_oficio_documento: "Fecha de oficio/documento",
  fecha_ingreso_senaf: "Fecha de ingreso SENAF",
  tipo_institucion: "Tipo de organismo",
  institucion: "Institución",
  ambito_vulneracion: "Ámbito de vulneración",
  motivo_ingreso: "Motivo de intervención",
  submotivo_ingreso: "Submotivo de intervención",
  vinculo_demanda: "Vínculo con la demanda",
  legajo: "Legajo",
  medida: "Medida",
  tipo_vinculo: "Tipo de vínculo",
  justificacion: "Justificación",
  justificacion_tecnico: "Justificación del técnico",
  justificacion_director: "Justificación del director",
  descripcion_de_la_situacion: "Descripción de la situación",
  valoracion_profesional_final: "Valoración profesional final",
  tipo_medida_evaluado: "Tipo de medida",
  nnyas_evaluados_id: "NNyA evaluados",
  solicitud_tecnico: "Solicitud del técnico",
  decision_director: "Decisión del director",
  uploaded_files: "Archivos adjuntos",
  observaciones: "Observaciones",
  zona: "Zona",
  codigo: "Código",
  tipo_codigo: "Tipo de código",
}

// Listas del backend: se numeran ("Persona 2") en lugar de mostrar el índice crudo.
const LIST_LABELS: Record<string, string> = {
  personas: "Persona",
  vinculos: "Vínculo",
  adjuntos: "Adjunto",
  codigos_demanda: "Código de demanda",
}

// Objetos contenedores que no aportan información al usuario.
const TRANSPARENT_KEYS = new Set(["persona", "demanda_persona", "localizacion", "relacion_demanda", "demanda_zona"])

const SEPARATOR = " › "

const translateMessage = (raw: string): string => {
  const maxValue = raw.match(/menor o igual a (\d+)/i)
  if (maxValue) {
    const max = Number(maxValue[1]).toLocaleString("es-AR")
    return `El valor es demasiado grande (máximo ${max}). Revisá que no tenga más dígitos de los permitidos.`
  }
  if (/HeadObject|S3|storage/i.test(raw) && /403|forbidden/i.test(raw)) {
    return "No se pudieron guardar los archivos adjuntos (el servidor de archivos rechazó el acceso). Probá enviar sin adjuntos y avisá a soporte."
  }
  return raw
}

const collectMessages = (node: unknown, path: string[], out: string[]): void => {
  if (node === null || node === undefined) return

  if (typeof node === "string") {
    // Un error 500 del servidor llega como una página HTML: no se muestra tal cual al usuario.
    if (/^\s*<(!doctype|html)/i.test(node)) return
    const message = translateMessage(node)
    out.push(path.length ? `${path.join(SEPARATOR)}: ${message}` : message)
    return
  }

  if (Array.isArray(node)) {
    node.forEach((item) => collectMessages(item, path, out))
    return
  }

  if (typeof node === "object") {
    Object.entries(node as Record<string, unknown>).forEach(([key, value]) => {
      if (Array.isArray(value) && LIST_LABELS[key]) {
        value.forEach((item, index) => collectMessages(item, [...path, `${LIST_LABELS[key]} ${index + 1}`], out))
      } else if (TRANSPARENT_KEYS.has(key)) {
        collectMessages(value, path, out)
      } else if (key === "detail" || key === "error" || key === "non_field_errors") {
        collectMessages(value, path, out)
      } else {
        collectMessages(value, [...path, FIELD_LABELS[key] ?? key], out)
      }
    })
  }
}

export interface DescribedApiError {
  /** Texto corto para el toast (puede tener varias líneas). */
  message: string
  /** Detalle técnico completo, para "Ver detalles" / copiar. */
  details: string
}

const MAX_LINES = 4

export const describeApiError = (error: any, fallbackTitle = "No se pudo completar la operación"): DescribedApiError => {
  if (!error?.response) {
    return {
      message: "No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.",
      details: error?.message ?? "Sin detalles adicionales.",
    }
  }

  const { status, data } = error.response
  const lines: string[] = []
  collectMessages(data, [], lines)

  const visible = lines.slice(0, MAX_LINES).map((line) => `• ${line}`)
  if (lines.length > MAX_LINES) visible.push(`• y ${lines.length - MAX_LINES} más (ver detalles)`)

  const title = lines.length ? fallbackTitle : getErrorMessage(status || 500)
  const details = `Código de error: ${status}\nRespuesta del servidor: ${JSON.stringify(data, null, 2) ?? "Sin detalles adicionales."}`

  return {
    message: [title, ...visible].join("\n"),
    details,
  }
}
