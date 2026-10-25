import { describe, expect, it } from "vitest"

import { formatEstadoDemanda, formatObjetivoDemanda } from "@/utils/demandaLabels"

describe("formatEstadoDemanda", () => {
  it("devuelve el nombre con tildes de los estados conocidos", () => {
    expect(formatEstadoDemanda("CONSTATACION")).toBe("Constatación")
    expect(formatEstadoDemanda("EVALUACION")).toBe("Evaluación")
    expect(formatEstadoDemanda("PENDIENTE_AUTORIZACION")).toBe("Pendiente Autorización")
    expect(formatEstadoDemanda("SIN_ASIGNAR")).toBe("Sin Asignar")
  })

  it("mantiene los nombres especiales del Poder Judicial", () => {
    expect(formatEstadoDemanda("PENDIENTE_SUBIR_PJ")).toBe("Listo para subir al PJ")
    expect(formatEstadoDemanda("SUBIDO_A_PODER_JUDICIAL")).toBe("Subido al PJ")
  })

  it("deja legible un estado nuevo que todavía no tiene nombre propio", () => {
    expect(formatEstadoDemanda("ALGO_NUEVO")).toBe("Algo Nuevo")
  })

  it("devuelve vacío si no hay estado", () => {
    expect(formatEstadoDemanda(null)).toBe("")
    expect(formatEstadoDemanda(undefined)).toBe("")
    expect(formatEstadoDemanda("")).toBe("")
  })
})

describe("formatObjetivoDemanda", () => {
  it("devuelve el nombre con tildes", () => {
    expect(formatObjetivoDemanda("PROTECCION")).toBe("Protección")
    expect(formatObjetivoDemanda("PETICION_DE_INFORME")).toBe("Petición de Informe")
    expect(formatObjetivoDemanda("CARGA_OFICIOS")).toBe("Carga de Oficios")
  })

  it("devuelve vacío si no hay objetivo", () => {
    expect(formatObjetivoDemanda(null)).toBe("")
  })
})
