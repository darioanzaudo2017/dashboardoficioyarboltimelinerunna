import type React from 'react'
import type { GlobalActividadFilters } from '../../services/globalActividadService'
import type { Usuario } from '@/app/(runna)/legajo-mesa/types/asignacion-types'

export const getUserDisplayName = (user: Usuario) => {
    return user.nombre_completo || `${user.first_name} ${user.last_name}`.trim() || user.username
  }

// Prevent form submission on Enter key
export const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

// Count active advanced filters
export const countAdvancedFilters = (filters: GlobalActividadFilters) =>
  [
    filters.actor,
    filters.origen,
    filters.estado,
    filters.ordering && filters.ordering !== '-fecha_creacion' ? filters.ordering : undefined,
    filters.nnya_nombre,
    filters.nnya_dni,
    filters.numero_legajo,
    filters.tipo_medida,
    filters.categoria_oficio,
    filters.tipo_oficio,
    filters.estado_oficio,
    filters.responsable,
    filters.tipo_actividad,
    filters.zona,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.fecha_creacion_desde,
    filters.fecha_creacion_hasta,
    filters.vencida,
    filters.pendiente_visado,
    filters.es_borrador,
    filters.dias_restantes_max,
    filters.sin_leer, // Sprint 2: Lectura Multi-Usuario
  ].filter(Boolean).length
