/**
 * Mapper functions to transform full-detail demanda data to seguimiento dispositivo types
 */

import type { InformacionEducativa, InformacionSalud } from '../types/seguimiento-dispositivo'
import { getCurrentDateISO } from "@/utils/dateUtils"

/**
 * Full detail demanda response type (partial, only what we need)
 * Based on actual API structure from registro-demanda-form full-detail endpoint
 */
interface DemandaFullDetail {
  personas?: Array<{
    persona: {
      id: number
      nombre: string
      apellido: string
    }
    educacion?: {
      id: number
      nivel_alcanzado?: string // PRIMARIO, SECUNDARIO, etc.
      esta_escolarizado?: boolean
      ultimo_cursado?: string // TERCERO_SECUNDARIO, etc.
      tipo_escuela?: string // PRIVADA, PUBLICA, etc.
      comentarios_educativos?: string
      institucion_educativa?: {
        id: number
        nombre: string
      }
    } | null
    cobertura_medica?: {
      id: number
      obra_social?: string
      intervencion?: string // OBRA_SOCIAL, etc.
      auh?: boolean
      observaciones?: string
      institucion_sanitaria?: {
        id: number
        nombre: string
      }
      medico_cabecera?: {
        id: number
        nombre: string
        mail?: string
        telefono?: number
      }
    } | null
    persona_enfermedades?: Array<{
      enfermedad?: {
        id: number
        nombre: string
      }
      situacion_salud?: {
        id: number
        nombre: string
      }
      recibe_tratamiento?: boolean
      informacion_tratamiento?: string
      certificacion?: string // NO_TIENE, CUD, etc.
    }>
    condiciones_vulnerabilidad?: Array<{
      id: number
      nombre: string
    }>
  }>
}

/**
 * Map demanda full-detail educacion data to InformacionEducativa
 */
export function mapEducacionFromDemanda(demandaData: DemandaFullDetail, personaId?: number): InformacionEducativa {
  // Find the main NNyA or use the first persona
  const persona = demandaData.personas?.find(p =>
    personaId ? p.persona.id === personaId : true
  ) || demandaData.personas?.[0]

  if (!persona?.educacion) {
    return {}
  }

  const educacion = persona.educacion

  // Format nivel_educativo (PRIMARIO → Primario, SECUNDARIO → Secundario)
  const formatNivel = (nivel?: string) => {
    if (!nivel) return ''
    return nivel.charAt(0) + nivel.slice(1).toLowerCase()
  }

  // Format ultimo_cursado (TERCERO_SECUNDARIO → 3° Secundario)
  const formatCursado = (cursado?: string) => {
    if (!cursado) return ''
    const match = cursado.match(/^(PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SEPTIMO)_(PRIMARIO|SECUNDARIO)$/)
    if (!match) return cursado

    const grados: Record<string, string> = {
      PRIMERO: '1°', SEGUNDO: '2°', TERCERO: '3°',
      CUARTO: '4°', QUINTO: '5°', SEXTO: '6°', SEPTIMO: '7°'
    }
    return `${grados[match[1]]} ${formatNivel(match[2])}`
  }

  return {
    id: educacion.id,
    nivel_educativo: formatNivel(educacion.nivel_alcanzado),
    establecimiento: educacion.institucion_educativa?.nombre || '',
    grado_curso: formatCursado(educacion.ultimo_cursado),
    turno: '', // Not available in API
    rendimiento: educacion.esta_escolarizado ? 'Escolarizado' : 'No escolarizado',
    asistencia: educacion.tipo_escuela || '', // Using tipo_escuela as asistencia
    observaciones: educacion.comentarios_educativos || '',
    fecha_actualizacion: getCurrentDateISO()
  }
}

/**
 * Map demanda full-detail cobertura_medica data to InformacionSalud
 */
export function mapSaludFromDemanda(demandaData: DemandaFullDetail, personaId?: number): InformacionSalud {
  // Find the main NNyA or use the first persona
  const persona = demandaData.personas?.find(p =>
    personaId ? p.persona.id === personaId : true
  ) || demandaData.personas?.[0]

  if (!persona?.cobertura_medica) {
    return {}
  }

  const cobertura = persona.cobertura_medica

  return {
    id: cobertura.id,
    obra_social: cobertura.obra_social || '',
    intervencion: cobertura.intervencion || '',
    auh: cobertura.auh || false,
    institucion_sanitaria_id: cobertura.institucion_sanitaria?.id,
    centro_salud: cobertura.institucion_sanitaria?.nombre || '',
    observaciones: cobertura.observaciones || '',
  }
}

/**
 * Enhanced version with discapacidad and CUD detection
 */
export function mapSaludFromDemandaEnhanced(demandaData: DemandaFullDetail, personaId?: number): InformacionSalud {
  return mapSaludFromDemanda(demandaData, personaId)
}
