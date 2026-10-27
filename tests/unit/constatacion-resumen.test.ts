import { describe, expect, it } from "vitest"

import {
  countItems,
  describeConstatacion,
  tabLabelWithCount,
} from "@/app/(runna)/demanda/utils/constatacionResumen"

describe("countItems", () => {
  it("cuenta un arreglo", () => {
    expect(countItems([{ id: 1 }, { id: 2 }])).toBe(2)
    expect(countItems([])).toBe(0)
  })

  it("usa count o results cuando la respuesta viene paginada", () => {
    expect(countItems({ count: 7, results: [{ id: 1 }] })).toBe(7)
    expect(countItems({ results: [{ id: 1 }, { id: 2 }, { id: 3 }] })).toBe(3)
  })

  it("devuelve null mientras no hay datos", () => {
    expect(countItems(undefined)).toBeNull()
    expect(countItems(null)).toBeNull()
    expect(countItems({})).toBeNull()
  })
})

describe("tabLabelWithCount", () => {
  it("agrega el número entre paréntesis, incluido el cero", () => {
    expect(tabLabelWithCount("Registrar Actividad", 3)).toBe("Registrar Actividad (3)")
    expect(tabLabelWithCount("Enviar Respuesta", 0)).toBe("Enviar Respuesta (0)")
  })

  it("deja el nombre solo si todavía no se cargó el dato", () => {
    expect(tabLabelWithCount("Enviar Respuesta", null)).toBe("Enviar Respuesta")
  })
})

describe("describeConstatacion", () => {
  it("usa singular y plural", () => {
    expect(describeConstatacion(1, 1)).toBe("1 actividad registrada y 1 respuesta enviada")
    expect(describeConstatacion(3, 2)).toBe("3 actividades registradas y 2 respuestas enviadas")
  })

  it("informa los ceros sin juzgarlos", () => {
    expect(describeConstatacion(0, 0)).toBe("0 actividades registradas y 0 respuestas enviadas")
  })
})
