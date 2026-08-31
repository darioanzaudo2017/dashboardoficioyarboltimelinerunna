/**
 * Date Utility Functions
 *
 * Centralized date formatting and manipulation utilities.
 * Extracted from 12+ duplicate implementations across the codebase.
 */

/**
 * Get current date in ISO format (YYYY-MM-DD)
 *
 * Replaces the pattern: new Date().toISOString().split("T")[0]
 * Found in 12+ locations across the codebase.
 *
 * @returns Current date in YYYY-MM-DD format
 *
 * @example
 * getCurrentDateISO() // "2025-12-25"
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString().split("T")[0]
}

const ISO_DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Date-only values represent calendar dates, not UTC instants. Parsing them with
 * `new Date("YYYY-MM-DD")` moves the date to the previous day in Argentina.
 */
const toDateObject = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date
  }

  const match = ISO_DATE_ONLY_PATTERN.exec(date)
  if (!match) {
    return new Date(date)
  }

  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

/**
 * Format date for Argentina locale (es-AR) - Date only
 *
 * Replaces multiple .toLocaleDateString("es-AR", ...) implementations
 *
 * @param date - Date string or Date object to format
 * @returns Date formatted as DD/MM/YYYY
 *
 * @example
 * formatDateLocaleAR("2025-12-25") // "25/12/2025"
 * formatDateLocaleAR(new Date()) // "25/12/2025"
 */
export const formatDateLocaleAR = (date: Date | string): string => {
  const dateObj = toDateObject(date)
  return dateObj.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Format date and time for Argentina locale (es-AR)
 *
 * @param date - Date string or Date object to format
 * @returns Date and time formatted as DD/MM/YYYY HH:MM
 *
 * @example
 * formatDateTimeLocaleAR("2025-12-25T14:30:00Z") // "25/12/2025 14:30"
 */
export const formatDateTimeLocaleAR = (date: Date | string): string => {
  const dateObj = toDateObject(date)
  return dateObj.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format date for Spain locale (es-ES) - Date only
 *
 * Alternative locale for compatibility
 *
 * @param date - Date string or Date object to format
 * @returns Date formatted as DD/MM/YYYY
 *
 * @example
 * formatDateLocaleES("2025-12-25") // "25/12/2025"
 */
export const formatDateLocaleES = (date: Date | string): string => {
  const dateObj = toDateObject(date)
  return dateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Format date and time for Spain locale (es-ES)
 *
 * @param date - Date string or Date object to format
 * @returns Date and time formatted as DD/MM/YYYY HH:MM
 *
 * @example
 * formatDateTimeLocaleES("2025-12-25T14:30:00Z") // "25/12/2025 14:30"
 */
export const formatDateTimeLocaleES = (date: Date | string): string => {
  const dateObj = toDateObject(date)
  return dateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Parse ISO date string to Date object
 *
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Date object
 *
 * @example
 * parseISODate("2025-12-25") // Date object
 */
export const parseISODate = (isoDate: string): Date => {
  return toDateObject(isoDate)
}

/**
 * Check if a date string is valid
 *
 * @param dateString - Date string to validate
 * @returns true if the date is valid
 *
 * @example
 * isValidDate("2025-12-25") // true
 * isValidDate("invalid") // false
 */
export const isValidDate = (dateString: string): boolean => {
  const trimmedDate = dateString.trim()
  if (!trimmedDate) {
    return false
  }

  const dateOnlyMatch = ISO_DATE_ONLY_PATTERN.exec(trimmedDate)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    const date = toDateObject(trimmedDate)

    return (
      date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day)
    )
  }

  const date = new Date(trimmedDate)
  return !isNaN(date.getTime())
}

/**
 * Calcula una edad sólo cuando la fecha es consistente. Las fechas futuras o
 * edades fuera de un rango humano razonable se consideran datos inválidos.
 */
export const calculateAge = (
  birthDate: string | null | undefined,
  referenceDate: Date = new Date(),
  maxAge: number = 120,
): number | null => {
  if (!birthDate || !isValidDate(birthDate)) return null

  const birth = toDateObject(birthDate)
  if (birth.getTime() > referenceDate.getTime()) return null

  let age = referenceDate.getFullYear() - birth.getFullYear()
  const monthDifference = referenceDate.getMonth() - birth.getMonth()
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && referenceDate.getDate() < birth.getDate())
  ) {
    age -= 1
  }

  return age >= 0 && age <= maxAge ? age : null
}
