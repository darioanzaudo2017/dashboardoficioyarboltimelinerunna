import * as XLSX from "xlsx"
import { toast } from "react-toastify"
import { getCurrentDateISO } from "@/utils/dateUtils"
import { formatUnderscoreText } from "./utils"
import type { DemandaRow } from "./utils"

// Add this function to handle Excel export
export const exportDemandasToXlsx = (rows: DemandaRow[]) => {
  // Create a worksheet from the filtered rows
  const worksheet = XLSX.utils.json_to_sheet(
    rows.map((row) => {
      // Create a clean object for export, formatting data as needed
      return {
        ID: row.id,
        // Score: row.score, // HIDDEN
        Nombre: row.nombre,
        DNI: row.dni,
        Calificación: formatUnderscoreText(row.calificacion),
        "Última Actualización": row.ultimaActualizacion,
        Localidad: row.localidad,
        "Zona/Equipo": row.zonaEquipo,
        Estado: formatUnderscoreText(row.estado_demanda),
        "Envío Respuesta": formatUnderscoreText(row.envioRespuesta),
        "Objetivo de Demanda": formatUnderscoreText(row.objetivoDemanda),
        Etiqueta: row.etiqueta,
        "Cantidad de Adjuntos": Array.isArray(row.adjuntos) ? row.adjuntos.length : 0,
      }
    }),
  )

  // Set column widths
  const columnWidths = [
    { wch: 10 }, // ID
    // { wch: 10 }, // Score - HIDDEN
    { wch: 30 }, // Nombre
    { wch: 15 }, // DNI
    { wch: 20 }, // Calificación
    { wch: 20 }, // Última Actualización
    { wch: 20 }, // Localidad
    { wch: 20 }, // Zona/Equipo
    { wch: 20 }, // Estado
    { wch: 20 }, // Envío Respuesta
    { wch: 25 }, // Objetivo de Demanda
    { wch: 20 }, // Etiqueta
    { wch: 20 }, // Cantidad de Adjuntos
  ]
  worksheet["!cols"] = columnWidths

  // Create a workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Demandas")

  // Generate Excel file and trigger download
  const currentDate = getCurrentDateISO()
  XLSX.writeFile(workbook, `Demandas_${currentDate}.xlsx`)

  // Show success message
  toast.success("Archivo Excel generado correctamente", {
    position: "top-center",
    autoClose: 3000,
  })
}
