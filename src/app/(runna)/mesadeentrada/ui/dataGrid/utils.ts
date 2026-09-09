import type { TDemanda } from "@/app/interfaces"
import { institutionalColors } from "@/theme/colors"

// Helper function to get file name from URL
export const getFileNameFromUrl = (url: string): string => {
  const parts = url.split("/")
  return parts[parts.length - 1]
}

/**
 * Placeholder del campo `dni` cuando el NNyA no tiene DNI propio y los datos
 * salen de un legajo vinculado. Se exporta para que la grilla pueda distinguir
 * ese caso del de un DNI real sin repetir el literal.
 */
export const DNI_VER_LEGAJO = "Ver legajo"

export const formatCalificacionValue = (value: string | undefined | null) => {
  return value || "Seleccionar"
}

export const getStatusColor = (estado: string) => {
  switch (estado) {
    case "SIN_ASIGNAR":
      return "#e0e0e0" // gray
    case "CONSTATACION":
      return "#4caf50" // green
    case "EVALUACION":
      return "#2196f3" // blue
    case "PENDIENTE_AUTORIZACION":
      return "#ff9800" // orange
    case "ARCHIVADA":
      return "#9e9e9e" // dark gray
    case "ADMITIDA":
      return "#673ab7" // purple
    case "RESPUESTA_SIN_ENVIAR":
      return "#f44336" // red
    case "INFORME_SIN_ENVIAR":
      return "#ecff0c" // Amarillo
    case "REPUESTA_ENVIADA":
      return "#8bc34a" // light green
    case "INFORME_ENVIADO":
      return institutionalColors.azulClaro // Azul Claro institucional
    default:
      return "transparent"
  }
}

// Helper function to format text with underscores
export const formatUnderscoreText = (text: any): string => {
  if (!text || typeof text !== "string" || text === "N/A") {
    return "N/A"
  }

  return text
    .split("_")
    .join(" ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Helper function to get NNyA name with fallback for CARGA_OFICIOS
export const getNnyaNombre = (demanda: TDemanda): { nombre: string; apellido: string; isFromLinkedLegajo: boolean; legajoNumero?: string } => {
  // Primary: nnya_principal (normal demandas)
  if (demanda.nnya_principal) {
    return {
      nombre: demanda.nnya_principal.nombre || "N/A",
      apellido: demanda.nnya_principal.apellido || "N/A",
      isFromLinkedLegajo: false,
    }
  }
  // Fallback: nnya_nombre_legajo (CARGA_OFICIOS linked to existing legajo)
  if (demanda.nnya_nombre_legajo) {
    return {
      nombre: demanda.nnya_nombre_legajo.nombre || "N/A",
      apellido: demanda.nnya_nombre_legajo.apellido || "N/A",
      isFromLinkedLegajo: true,
      legajoNumero: demanda.nnya_nombre_legajo.legajo_numero,
    }
  }
  // Fallback: campos planos del oficio (PETICION_DE_INFORME, sin persona ni legajo vinculado)
  if ((demanda as any).nombre || (demanda as any).apellido) {
    return {
      nombre: (demanda as any).nombre || "N/A",
      apellido: (demanda as any).apellido || "N/A",
      isFromLinkedLegajo: false,
    }
  }
  return { nombre: "N/A", apellido: "N/A", isFromLinkedLegajo: false }
}

/** Proyecta una demanda del backend a la fila que consumen la tabla, las tarjetas y el export. */
export const mapDemandaToRow = (demanda: TDemanda) => {
  const nnyaInfo = getNnyaNombre(demanda)
  return {
    id: demanda.id,
    // score: demanda.demanda_score?.score || "N/A", // HIDDEN
    origen: demanda.bloque_datos_remitente?.nombre || "N/A",
    nombre: nnyaInfo.nombre,
    apellido: nnyaInfo.apellido,
    isFromLinkedLegajo: nnyaInfo.isFromLinkedLegajo,
    linkedLegajoNumero: nnyaInfo.legajoNumero,
    // `||` liga mas fuerte que `?:`, asi que la version anterior se evaluaba como
    // `(dni || nnya_nombre_legajo) ? "Ver legajo" : ...` y pisaba el DNI real con el
    // literal "Ver legajo" justo cuando el NNyA SI lo tenia. Los parentesis son obligatorios.
    dni:
      demanda.nnya_principal?.dni ||
      (demanda as any).dni_oficio ||
      (demanda.nnya_nombre_legajo ? DNI_VER_LEGAJO : "N/A"),
    hasLegajo: !!(demanda.nnya_principal?.legajo) || !!(demanda.nnya_nombre_legajo),
    legajoNumero: demanda.nnya_principal?.legajo?.numero || demanda.nnya_nombre_legajo?.legajo_numero || "N/A",
    calificacion: demanda.calificacion?.estado_calificacion || null,
    ultimaActualizacion: new Date(demanda.ultima_actualizacion).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    codigosDemanda: demanda.codigos_demanda || [],
    localidad: demanda.localidad?.nombre || "N/A",
    cpc: demanda.cpc?.nombre || "N/A",
    zonaEquipo: demanda.demanda_zona?.zona?.nombre || demanda.registrado_por_user_zona?.nombre || "N/A",
    usuario: demanda.registrado_por_user?.username || "N/A",
    areaSenaf: demanda.area_senaf || "N/A",
    estado_demanda: demanda.estado_demanda,
    recibido: demanda.demanda_zona?.recibido || false,
    demanda_zona_id: demanda.demanda_zona_id,
    envioRespuesta: demanda.envio_de_respuesta || "N/A",
    objetivoDemanda: demanda.objetivo_de_demanda || "N/A",
    etiqueta: demanda.etiqueta?.nombre || "N/A",
    adjuntos: demanda.adjuntos || [],
    calificacion_choices: demanda.calificacion_choices || [],
  }
}

export type DemandaRow = ReturnType<typeof mapDemandaToRow>
