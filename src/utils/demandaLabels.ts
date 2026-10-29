import { formatUnderscoreText } from "@/utils/stringUtils"

/**
 * Nombres legibles (con tildes) de los valores que devuelve el backend para el estado y el objetivo
 * de una demanda. Antes se mostraba el valor crudo ("CONSTATACION") en algunas pantallas y el nombre
 * correcto ("Constatación") en otras.
 */
export const ESTADO_DEMANDA_LABELS: Record<string, string> = {
  SIN_ASIGNAR: "Sin Asignar",
  CONSTATACION: "Constatación",
  EVALUACION: "Evaluación",
  PENDIENTE_AUTORIZACION: "Pendiente Autorización",
  ARCHIVADA: "Archivada",
  ADMITIDA: "Admitida",
  RESPUESTA_SIN_ENVIAR: "Respuesta Sin Enviar",
  INFORME_SIN_ENVIAR: "Informe Sin Enviar",
  REPUESTA_ENVIADA: "Respuesta Enviada", // el backend lo escribe así (sin la "s")
  INFORME_ENVIADO: "Informe Enviado",
  PENDIENTE_SUBIR_PJ: "Listo para subir al PJ",
  SUBIDO_A_PODER_JUDICIAL: "Subido al PJ",
}

export const OBJETIVO_DEMANDA_LABELS: Record<string, string> = {
  PROTECCION: "Protección",
  PETICION_DE_INFORME: "Petición de Informe",
  CARGA_OFICIOS: "Carga de Oficios",
  CONSTATACION: "Constatación",
}

const labelFor = (labels: Record<string, string>, value?: string | null): string => {
  if (!value) return ""
  return labels[value] ?? formatUnderscoreText(value)
}

/** "CONSTATACION" → "Constatación". Si el valor no se conoce lo deja legible ("ALGO_NUEVO" → "Algo Nuevo"). */
export const formatEstadoDemanda = (estado?: string | null): string => labelFor(ESTADO_DEMANDA_LABELS, estado)

/** "PROTECCION" → "Protección". */
export const formatObjetivoDemanda = (objetivo?: string | null): string =>
  labelFor(OBJETIVO_DEMANDA_LABELS, objetivo)
