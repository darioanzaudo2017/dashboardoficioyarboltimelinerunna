import type { NNyADataResponse } from "../../../../api/personas-relacionadas-api-service"
import type { PersonaData, PersonaFormState } from "../types"

interface BuildPersonaFormStateParams {
  nnyaData: NNyADataResponse | undefined
  persona: PersonaData | undefined
  localizacion: any | null
  educacion: any | null
  saludData: { cobertura_medica: any | null; persona_enfermedades: any[] } | null
  vulnerabilidadData: { condiciones_vulnerabilidad?: any[] } | undefined
}

// Initialize form data when entering edit mode
export function buildPersonaFormState({
  nnyaData,
  persona,
  localizacion,
  educacion,
  saludData,
  vulnerabilidadData,
}: BuildPersonaFormStateParams): PersonaFormState {
    // Helper to extract ID from object or return value if already a number
    const extractId = (value: any): number | null => {
      if (!value) return null
      if (typeof value === "number") return value
      if (typeof value === "object" && value.id) return value.id
      return null
    }

    // Use NNyA data which has the correct field names from /api/legajos/{id}/nnya/
    const loc = localizacion as any
    const edu = educacion as any
    const salud = saludData?.cobertura_medica as any

    const initialData: PersonaFormState = {
      nombre: nnyaData?.nombre || persona?.nombre || "",
      nombre_autopercibido: nnyaData?.nombre_autopercibido || persona?.nombre_autopercibido || "",
      apellido: nnyaData?.apellido || persona?.apellido || "",
      fecha_nacimiento: nnyaData?.fecha_nacimiento || persona?.fecha_nacimiento || "",
      edad_aproximada: (nnyaData?.edad_aproximada || persona?.edad_aproximada)?.toString() || "",
      nacionalidad: nnyaData?.nacionalidad || persona?.nacionalidad || "",
      dni: (nnyaData?.dni || persona?.dni)?.toString() || "",
      situacion_dni: nnyaData?.situacion_dni || persona?.situacion_dni || "",
      genero: nnyaData?.genero || persona?.genero || "",
      telefono: (nnyaData?.telefono || persona?.telefono)?.toString() || "",
      observaciones: nnyaData?.observaciones || persona?.observaciones || "",
      // Location - NNyA response uses casa_nro, piso_depto, and FKs are already integers
      calle: loc?.calle || "",
      numero: loc?.casa_nro?.toString() || "", // API field is casa_nro
      piso: loc?.piso_depto || "", // API field is piso_depto
      departamento: "", // Not in NNyA response
      barrio: typeof loc?.barrio === "number" ? loc.barrio : extractId(loc?.barrio),
      localidad: typeof loc?.localidad === "number" ? loc.localidad : extractId(loc?.localidad),
      cpc: typeof loc?.cpc === "number" ? loc.cpc : extractId(loc?.cpc),
      referencia_geo: loc?.referencia_geo || "",
      mza: loc?.mza?.toString() || "",
      lote: loc?.lote?.toString() || "",
      // Education - institucion_educativa can be object with id/nombre
      institucion_educativa: extractId(edu?.institucion_educativa),
      nivel_alcanzado: edu?.nivel_alcanzado || "",
      esta_escolarizado: edu?.esta_escolarizado || false,
      ultimo_cursado: edu?.ultimo_cursado || "",
      tipo_escuela: edu?.tipo_escuela || "",
      comentarios_educativos: edu?.comentarios_educativos || "",
      // Health - institucion_sanitaria can be object with id/nombre
      institucion_sanitaria: extractId(salud?.institucion_sanitaria),
      obra_social: salud?.obra_social || "",
      intervencion: salud?.intervencion || "",
      auh: salud?.auh || false,
      medico_cabecera: extractId(salud?.medico_cabecera),
      // Display-only fields for medico info
      medico_nombre: salud?.medico_cabecera?.nombre || "",
      medico_mail: salud?.medico_cabecera?.mail || "",
      medico_telefono: salud?.medico_cabecera?.telefono || "",
      observaciones_medicas: salud?.observaciones || "",
      // Vulnerability
      condiciones_vulnerabilidad: vulnerabilidadData?.condiciones_vulnerabilidad?.map((c: any) => c.condicion_vulnerabilidad?.id || c.id) || [],
    }

  return initialData
}
