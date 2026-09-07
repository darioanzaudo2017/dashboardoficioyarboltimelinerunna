/**
 * API Service for Catalog Data (Dropdowns)
 * Endpoints: Various catalog endpoints for urgencias, zonas, users, locales
 */

import { get } from '@/app/api/apiService'
import { extractArray } from '@/hooks/useApiQuery'
import type {
  UrgenciaVulneracion,
  ZonaInfo,
  UserInfo,
  LocalCentroVida,
} from '../types/legajo-creation.types'
import { logger } from '@/utils/logger'

/**
 * Get all urgencias vulneracion for dropdown
 * @returns Array of urgencias
 */
export const getUrgencias = async (): Promise<UrgenciaVulneracion[]> => {
  try {
    const response = await get<
      UrgenciaVulneracion[] | { results: UrgenciaVulneracion[] }
    >('urgencia-vulneracion/')
    return extractArray(response)
  } catch (error) {
    logger.error('Error fetching urgencias:', error)
    return []
  }
}

/**
 * Get zonas available for current user (according to permissions)
 *
 * @returns Array of zonas
 */
export const getZonasDisponibles = async (): Promise<ZonaInfo[]> => {
  try {
    // This should return only zones where user has permissions
    // Backend should filter based on user permissions
    const response = await get<ZonaInfo[] | { results: ZonaInfo[] }>('zonas/')
    const zonas = extractArray(response)

    logger.log('Zonas fetched:', zonas)
    return zonas
  } catch (error) {
    logger.error('Error fetching zonas:', error)
    return []
  }
}

/**
 * Get users by zona
 *
 * @param zonaId - ID of zona to filter users
 * @returns Array of users in that zona
 */
export const getUsuariosPorZona = async (zonaId: number): Promise<UserInfo[]> => {
  try {
    // Endpoint: /api/users-zonas/?zona={zonaId}
    // Response includes user_info with expanded user data

    interface UserZonaResponse {
      id: number
      user: number
      zona: number
      jefe: boolean
      director: boolean
      legal: boolean
      localidad: number | null
      user_info: {
        id: number
        username: string
        first_name: string
        last_name: string
        email: string
        is_active: boolean
      }
    }

    const userZonasResponse = await get<UserZonaResponse[] | { results: UserZonaResponse[] }>(
      'users-zonas/',
      { zona: zonaId, page_size: 500 }
    )
    const userZonas = extractArray(userZonasResponse)

    if (userZonas.length === 0) {
      return []
    }

    // Map user details from user_info
    const users: UserInfo[] = userZonas
      .filter((uz: UserZonaResponse) => uz.user_info)
      .map((uz: UserZonaResponse) => {
        const info = uz.user_info
        return {
          id: info.id,
          username: info.username,
          first_name: info.first_name,
          last_name: info.last_name,
          email: info.email,
          nombre_completo: info.first_name && info.last_name
            ? `${info.first_name} ${info.last_name}`.trim()
            : info.username
        }
      })

    return users
  } catch (error) {
    logger.error(`Error fetching users for zona ${zonaId}:`, error)
    return []
  }
}

/**
 * Get locales centro de vida by zona
 *
 * @param zonaId - ID of zona to filter locales
 * @returns Array of locales in that zona
 */
export const getLocalesCentroVida = async (zonaId: number): Promise<LocalCentroVida[]> => {
  try {
    // Endpoint correcto: /api/locales-centro-vida/?zona={zonaId}
    const response = await get<LocalCentroVida[] | { results: LocalCentroVida[] }>('locales-centro-vida/', { zona: zonaId })
    const locales = extractArray(response)

    logger.log(`Locales for zona ${zonaId} fetched:`, locales)
    return locales
  } catch (error) {
    logger.error(`Error fetching locales for zona ${zonaId}:`, error)
    return []
  }
}

/**
 * Get all catalogos in a single call (optimization)
 * This is optional - use if backend provides a combined endpoint
 *
 * @returns Object with all catalogs
 */
export const getAllCatalogos = async () => {
  try {
    const [urgencias, zonas] = await Promise.all([
      getUrgencias(),
      getZonasDisponibles(),
    ])

    return {
      urgencias,
      zonas,
    }
  } catch (error) {
    logger.error('Error fetching all catalogos:', error)
    return {
      urgencias: [],
      zonas: [],
    }
  }
}
