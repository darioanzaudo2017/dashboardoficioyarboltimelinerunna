/**
 * API Service for Legajo Creation (LEG-02)
 * Endpoints: POST /api/legajos/, PUT /api/evaluaciones/{id}/autorizar/
 */

import axiosInstance from '@/app/api/utils/axiosInstance'
import axios from 'axios'
import { toast } from 'react-toastify'
import type {
  CreateLegajoManualRequest,
  CreateLegajoResponse,
  AutorizarAdmisionRequest,
  AutorizarAdmisionResponse,
} from '../types/legajo-creation.types'

interface ApiErrorPayload {
  detail?: string | Record<string, unknown>
}

/**
 * Create legajo manually
 * POST /api/legajos/
 *
 * @param data - Request data with NNyA and assignment information
 * @returns Created legajo with full details
 */
export const createLegajo = async (
  data: CreateLegajoManualRequest
): Promise<CreateLegajoResponse> => {
  try {
    const { data: response } = await axiosInstance.post<CreateLegajoResponse>('legajos/', data)

    if (!Number.isInteger(response?.id) || response.id <= 0 || !response.numero?.trim()) {
      throw new Error('El servidor no confirmó la creación del legajo con un identificador y número válidos')
    }

    // Show success toast
    toast.success(`Legajo ${response.numero} creado exitosamente`, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    })

    return response
  } catch (error: unknown) {
    const apiError = axios.isAxiosError<ApiErrorPayload>(error) ? error : null
    console.error('Error creating legajo:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      response: apiError?.response?.data,
      status: apiError?.response?.status,
    })

    // Handle specific error cases
    if (apiError?.response?.status === 409) {
      // Conflict - NNyA already has legajo
      const errorDetail = apiError.response.data?.detail
      const message = typeof errorDetail === 'string' ? errorDetail : 'El NNyA ya tiene un legajo asignado'
      toast.error(message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    } else if (apiError?.response?.status === 403) {
      // Forbidden - Permission denied
      const errorDetail = apiError.response.data?.detail
      const message = typeof errorDetail === 'string' ? errorDetail : 'No tiene permisos para crear legajos en esta zona'
      toast.error(message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    } else if (apiError?.response?.status === 400) {
      // Bad request - Validation error
      const errorDetail = apiError.response.data?.detail || 'Error de validación en los datos'
      const errorMsg = typeof errorDetail === 'string'
        ? errorDetail
        : 'Por favor, verifique los datos ingresados'

      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    } else {
      // Generic error
      const message = error instanceof Error && error.message.startsWith('El servidor no confirmó')
        ? error.message
        : 'Error al crear legajo. Por favor, intente nuevamente.'
      toast.error(message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    }

    throw error
  }
}

/**
 * Autorizar admision and create legajos automatically
 * PUT /api/evaluaciones/{demanda_pk}/autorizar/?autorizar=true
 *
 * @param demandaId - ID of the demanda being authorized
 * @param data - Authorization data (decision, justification)
 * @returns Response with created and existing legajos
 */
export const autorizarAdmisionYCrearLegajos = async (
  demandaId: number,
  data: AutorizarAdmisionRequest = {}
): Promise<AutorizarAdmisionResponse> => {
  try {
    // Use axiosInstance directly because the put() wrapper appends /${id}/ to the URL,
    // but the demandaId is already part of the endpoint path
    const { data: response } = await axiosInstance.put<AutorizarAdmisionResponse>(
      `evaluaciones/${demandaId}/autorizar/?autorizar=true`,
      {
        decision: data.decision || 'AUTORIZAR_ADMISION',
        justificacion_director: data.justificacion_director || 'Autorizado por Director',
        ...data
      }
    )

    // Check if response has legajos_creados field (expected structure)
    // or if it's just an evaluation response (actual structure)
    // Note: apiService.put() returns data directly, not wrapped in response.data
    if (response.legajos_creados !== undefined) {
      // Expected response structure with legajos
      const totalCreados = response.total_creados ?? response.legajos_creados.length
      const totalExistentes = response.total_existentes ?? response.legajos_existentes?.length ?? 0
      const successMsg = totalExistentes > 0
        ? `${totalCreados} legajo(s) creado(s), ${totalExistentes} vinculado(s) a legajos existentes`
        : `${totalCreados} legajo(s) creado(s) exitosamente`

      toast.success(successMsg, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })

      // Show individual legajo creation toasts
      response.legajos_creados.forEach((legajo) => {
        toast.info(`Legajo ${legajo.numero} creado para ${legajo.nnya.nombre} ${legajo.nnya.apellido}`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'info',
        })
      })
    } else {
      // Actual response structure - just evaluation object
      const nnyaCount = response.evaluacion_personas?.length || 0
      const successMsg = `Admisión autorizada para ${nnyaCount} NNyA`

      toast.success(successMsg, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    }

    return response
  } catch (error: unknown) {
    const apiError = axios.isAxiosError<ApiErrorPayload>(error) ? error : null
    console.error(`Error authorizing admision for demanda ${demandaId}:`, error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      response: apiError?.response?.data,
      status: apiError?.response?.status,
    })

    // Handle specific error cases
    if (apiError?.response?.status === 403) {
      toast.error('Solo Directores pueden autorizar admisión', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored',
      })
    } else if (apiError?.response?.status === 404) {
      toast.error('Demanda o evaluación no encontrada', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored',
      })
    } else if (apiError?.response?.status === 400) {
      const errorDetail = apiError.response.data?.detail
      const message = typeof errorDetail === 'string' ? errorDetail : 'Error en la validación de datos'
      toast.error(message, {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored',
      })
    } else {
      toast.error('Error al autorizar admisión. Por favor, intente nuevamente.', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored',
      })
    }

    throw error
  }
}
