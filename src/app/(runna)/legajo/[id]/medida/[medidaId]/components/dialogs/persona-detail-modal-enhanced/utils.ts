import { logger } from "@/utils/logger"
import type { NNyADataResponse } from "../../../api/personas-relacionadas-api-service"
import type { PersonaData } from "./types"

// Helper functions
export const formatFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "No registrado"
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return fecha || "No registrado"
  }
}

export const getInitials = (nombre: string = "", apellido: string = ""): string => {
  const n = nombre?.charAt(0) || ""
  const a = apellido?.charAt(0) || ""
  return `${n}${a}`.toUpperCase() || "??"
}

export const getAvatarColor = (nombre: string = ""): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ]
  const index = nombre.charCodeAt(0) % colors.length
  return colors[index] || colors[0]
}

export const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text)
    logger.log(`${label} copiado al portapapeles`)
  } catch (error) {
    logger.error("Error al copiar:", error)
  }
}

// Create display data that prioritizes nnyaData (most recent) over persona (from prop)
// This ensures UI updates immediately when nnyaData cache is updated after PATCH
export const buildDisplayData = (
  nnyaData: NNyADataResponse | undefined,
  persona: PersonaData | undefined,
) => ({
    nombre: nnyaData?.nombre || persona?.nombre || "",
    apellido: nnyaData?.apellido || persona?.apellido || "",
    nombre_autopercibido: nnyaData?.nombre_autopercibido || persona?.nombre_autopercibido || null,
    dni: nnyaData?.dni || persona?.dni || null,
    fecha_nacimiento: nnyaData?.fecha_nacimiento || persona?.fecha_nacimiento || null,
    edad_aproximada: nnyaData?.edad_aproximada || persona?.edad_aproximada || null,
    edad_calculada: nnyaData?.edad_calculada || persona?.edad_calculada || null,
    genero: nnyaData?.genero || persona?.genero || null,
    nacionalidad: nnyaData?.nacionalidad || persona?.nacionalidad || null,
    telefono: nnyaData?.telefono || persona?.telefono || null,
    situacion_dni: nnyaData?.situacion_dni || persona?.situacion_dni || null,
    observaciones: nnyaData?.observaciones || persona?.observaciones || null,
})

export type PersonaDisplayData = ReturnType<typeof buildDisplayData>
