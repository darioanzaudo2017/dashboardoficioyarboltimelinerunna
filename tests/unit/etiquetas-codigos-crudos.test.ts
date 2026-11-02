import { describe, expect, it } from "vitest"

import { getEtapaEstadoLabel } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/utils/etapa-estado-label"
import { getCalificacionLabel } from "@/app/(runna)/mesadeentrada/ui/dataGrid/utils"

const CODIGO_CRUDO = /^[A-Z0-9_]+$/

describe("getEtapaEstadoLabel (fila de etapa en la vista nueva)", () => {
  it("usa el catálogo para el estado de la MPI que el back devuelve crudo", () => {
    const etapa = {
      estado: "PENDIENTE_DE_INFORME_DE_CIERRE",
      estado_display: "PENDIENTE_DE_INFORME_DE_CIERRE",
      estado_especifico: { nombre_display: "(3) Pendiente de informe de cierre" },
    }

    expect(getEtapaEstadoLabel(etapa)).toBe("(3) Pendiente de informe de cierre")
  })

  it("mantiene el estado_display de las choices cuando es un texto", () => {
    expect(
      getEtapaEstadoLabel({ estado: "PENDIENTE_NOTA_AVAL", estado_display: "(3) Pendiente de Nota de Aval" }),
    ).toBe("(3) Pendiente de Nota de Aval")
  })

  it("no devuelve el código crudo si no hay etiqueta", () => {
    const label = getEtapaEstadoLabel({
      estado: "PENDIENTE_DE_INFORME_DE_CIERRE",
      estado_display: "PENDIENTE_DE_INFORME_DE_CIERRE",
      estado_especifico: 12,
    })

    expect(label).toBeUndefined()
  })
})

describe("getCalificacionLabel (mesa de entradas, solo lectura)", () => {
  const choices = [
    ["URGENTE", "Urgente"],
    ["PERTINENTE_CONSTATACION_URGENTE", "Pertinente de Constatación Urgente"],
  ]

  it("muestra la etiqueta de las choices del back", () => {
    expect(getCalificacionLabel("PERTINENTE_CONSTATACION_URGENTE", choices)).toBe("Pertinente de Constatación Urgente")
  })

  it("sin choices no muestra el código con guiones bajos", () => {
    const label = getCalificacionLabel("PERTINENTE_CONSTATACION_URGENTE", undefined)

    expect(label).not.toMatch(CODIGO_CRUDO)
    expect(label).not.toContain("_")
  })

  it("sin calificación muestra un guion", () => {
    expect(getCalificacionLabel(null, choices)).toBe("-")
  })
})
