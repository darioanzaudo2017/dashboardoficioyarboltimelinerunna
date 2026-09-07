import type { NNyAUpdateRequest } from "../../../../api/personas-relacionadas-api-service"
import type { PersonaFormState } from "../types"

  /**
   * Extract only modified fields by comparing current formData with initial values
   * This ensures PATCH semantics - only send changed fields
   */
export const getModifiedFields = (
  current: PersonaFormState,
  initial: PersonaFormState,
): NNyAUpdateRequest => {
    const modified: NNyAUpdateRequest = {}

    // Helper to parse integer or return null
    const parseIntOrNull = (value: string | number | null | undefined): number | null => {
      if (value === null || value === undefined || value === "") return null
      const parsed = typeof value === "number" ? value : parseInt(value, 10)
      return isNaN(parsed) ? null : parsed
    }

    // Helper to check if value changed (handles empty strings vs null)
    const hasChanged = (currentVal: any, initialVal: any): boolean => {
      // Normalize empty strings and null
      const normalizeCurrent = currentVal === "" ? null : currentVal
      const normalizeInitial = initialVal === "" ? null : initialVal
      return normalizeCurrent !== normalizeInitial
    }

    // Check personal info fields
    if (hasChanged(current.nombre, initial.nombre)) {
      modified.nombre = current.nombre || undefined
    }
    if (hasChanged(current.nombre_autopercibido, initial.nombre_autopercibido)) {
      modified.nombre_autopercibido = current.nombre_autopercibido || null
    }
    if (hasChanged(current.apellido, initial.apellido)) {
      modified.apellido = current.apellido || undefined
    }
    if (hasChanged(current.fecha_nacimiento, initial.fecha_nacimiento)) {
      modified.fecha_nacimiento = current.fecha_nacimiento || null
    }
    if (hasChanged(current.edad_aproximada, initial.edad_aproximada)) {
      modified.edad_aproximada = parseIntOrNull(current.edad_aproximada)
    }
    if (hasChanged(current.nacionalidad, initial.nacionalidad)) {
      modified.nacionalidad = current.nacionalidad || null
    }
    if (hasChanged(current.dni, initial.dni)) {
      modified.dni = parseIntOrNull(current.dni)
    }
    if (hasChanged(current.situacion_dni, initial.situacion_dni)) {
      modified.situacion_dni = current.situacion_dni || null
    }
    if (hasChanged(current.genero, initial.genero)) {
      modified.genero = current.genero || null
    }
    if (hasChanged(current.telefono, initial.telefono)) {
      modified.telefono = current.telefono || null
    }
    if (hasChanged(current.observaciones, initial.observaciones)) {
      modified.observaciones = current.observaciones || null
    }

    // Check location fields - only include localizacion if any field changed
    const localizacionChanged =
      hasChanged(current.calle, initial.calle) ||
      hasChanged(current.numero, initial.numero) ||
      hasChanged(current.piso, initial.piso) ||
      hasChanged(current.departamento, initial.departamento) ||
      hasChanged(current.barrio, initial.barrio) ||
      hasChanged(current.localidad, initial.localidad) ||
      hasChanged(current.cpc, initial.cpc) ||
      hasChanged(current.referencia_geo, initial.referencia_geo) ||
      hasChanged(current.mza, initial.mza) ||
      hasChanged(current.lote, initial.lote)

    if (localizacionChanged) {
      modified.localizacion = {
        calle: current.calle || undefined,
        casa_nro: current.numero || "",
        piso: current.piso || undefined,
        departamento: current.departamento || undefined,
        barrio: current.barrio,
        localidad: current.localidad,
        cpc: current.cpc,
        referencia_geo: current.referencia_geo || undefined,
        mza: parseIntOrNull(current.mza),
        lote: parseIntOrNull(current.lote),
      }
    }

    // Check education fields - only include educacion if any field changed
    const educacionChanged =
      hasChanged(current.institucion_educativa, initial.institucion_educativa) ||
      hasChanged(current.nivel_alcanzado, initial.nivel_alcanzado) ||
      hasChanged(current.esta_escolarizado, initial.esta_escolarizado) ||
      hasChanged(current.ultimo_cursado, initial.ultimo_cursado) ||
      hasChanged(current.tipo_escuela, initial.tipo_escuela) ||
      hasChanged(current.comentarios_educativos, initial.comentarios_educativos)

    if (educacionChanged) {
      modified.educacion = {
        institucion_educativa: current.institucion_educativa,
        nivel_alcanzado: current.nivel_alcanzado || null,
        esta_escolarizado: current.esta_escolarizado,
        ultimo_cursado: current.ultimo_cursado || null,
        tipo_escuela: current.tipo_escuela || null,
        comentarios_educativos: current.comentarios_educativos || null,
      }
    }

    // Check health/cobertura_medica fields - only include if any field changed
    const coberturaMedicaChanged =
      hasChanged(current.institucion_sanitaria, initial.institucion_sanitaria) ||
      hasChanged(current.obra_social, initial.obra_social) ||
      hasChanged(current.intervencion, initial.intervencion) ||
      hasChanged(current.auh, initial.auh) ||
      hasChanged(current.medico_cabecera, initial.medico_cabecera) ||
      hasChanged(current.observaciones_medicas, initial.observaciones_medicas)

    if (coberturaMedicaChanged) {
      modified.cobertura_medica = {
        institucion_sanitaria: current.institucion_sanitaria,
        obra_social: current.obra_social || null,
        intervencion: current.intervencion || null,
        auh: current.auh,
        medico_cabecera: current.medico_cabecera,
        observaciones: current.observaciones_medicas || null,
      }
    }

    return modified
  }
