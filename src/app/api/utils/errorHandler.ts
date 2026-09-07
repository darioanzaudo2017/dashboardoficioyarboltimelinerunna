import { getErrorMessage } from "@/utils/errorMessages";
import { showErrorToast } from "@/utils/showErrorToast";
import { logger } from "@/utils/logger";

/**
 * Handles API errors by logging and optionally showing a toast notification.
 * @param error The error object from the API call.
 * @param endpoint The endpoint being called.
 */
export const handleApiError = (error: any, endpoint: string): void => {
  if (error.response) {
    const { status, data } = error.response;

    //console.error(`API Error - ${endpoint}:`, { status, data });
    const errorMessage = getErrorMessage(status || 500);
    
    const errorCode = error?.response?.status || 'Desconocido';
    const detailMessage = error?.response?.data?.non_field_errors || JSON.stringify(error.response.data, null, 2) || 'Sin detalles adicionales.';
    const errorDetails = `Código de error: ${errorCode}\nRespuesta del servidor: ${detailMessage}`;

    showErrorToast(errorMessage, errorDetails); // Show toast for non-GET errors
  } else {
    //console.error(`API Error - ${endpoint}:`, error.message);
    logger.log(error)
    showErrorToast('Error de Conexion', error.message); // Show generic error for unknown issues
  }
};
