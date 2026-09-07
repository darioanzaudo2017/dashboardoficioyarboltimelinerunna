/**
 * File Validation Utilities
 *
 * Client-side validation for file uploads in Informe de Cierre
 * - Extension validation
 * - Size validation
 * - Size formatting
 */

import {
  formatFileSize,
  getFileExtension as getExtension,
  isAllowedExtension as isExtensionIn,
} from "@/utils/fileUtils"

// Re-export for backward compatibility
export { formatFileSize, getExtension as getFileExtension }

// ============================================================================
// CONSTANTS
// ============================================================================

export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"]
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface FileValidationResult {
  valid: boolean
  error?: string
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a file for upload
 * Checks extension and size
 *
 * @param file File to validate
 * @returns Validation result with error message if invalid
 */
export const validateFile = (file: File): FileValidationResult => {
  // Extract extension
  const extension = file.name.split(".").pop()?.toLowerCase()

  // Check if extension exists
  if (!extension) {
    return {
      valid: false,
      error: "El archivo no tiene extensión válida",
    }
  }

  // Check if extension is allowed
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Extensión no permitida. Solo se permiten: ${ALLOWED_EXTENSIONS.join(
        ", "
      ).toUpperCase()}`,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2)
    return {
      valid: false,
      error: `Archivo muy grande (${sizeMB} MB). Máximo permitido: ${MAX_FILE_SIZE_MB} MB`,
    }
  }

  // Valid file
  return { valid: true }
}

/**
 * Validate multiple files
 * Returns first error encountered or success
 *
 * @param files Files to validate
 * @returns Validation result
 */
export const validateFiles = (files: File[]): FileValidationResult => {
  for (const file of files) {
    const result = validateFile(file)
    if (!result.valid) {
      return result
    }
  }
  return { valid: true }
}

// ============================================================================
// FORMATTING UTILITIES - Imported from centralized location
// ============================================================================
// See top of file for imports and re-exports

/**
 * Check if file extension is allowed
 *
 * Delega en `isAllowedExtension` de `@/utils/fileUtils` (la versión general,
 * parametrizada por lista) aplicándole la lista de este módulo. Es la misma
 * computación que hacía la copia local: ambas resolvían la extensión con
 * `getFileExtension` de `@/utils/fileUtils` y la buscaban en `ALLOWED_EXTENSIONS`.
 *
 * @param filename File name
 * @returns True if extension is allowed
 */
export const isAllowedExtension = (filename: string): boolean => {
  return isExtensionIn(filename, ALLOWED_EXTENSIONS)
}

/**
 * Generate accept attribute for file input
 *
 * @returns Accept attribute value (e.g., ".pdf,.doc,.docx,...")
 */
export const getAcceptAttribute = (): string => {
  return ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")
}
