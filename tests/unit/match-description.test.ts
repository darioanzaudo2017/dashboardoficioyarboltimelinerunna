import { describe, expect, it } from "vitest"

import { normalizeMatchDescription } from "@/components/forms/utils/matchDescription"

describe("normalizeMatchDescription", () => {
  it("reemplaza 'vinculado a la demanda N' por una coincidencia, porque todavía no se vinculó nada", () => {
    const original =
      "Se encontró coincidencia en la localización por match en el campo 'calle' (Colon) y 'localidad' (CORDOBA); vinculado a la demanda 323"

    expect(normalizeMatchDescription(original)).toBe(
      "Se encontró coincidencia en la localización por match en el campo 'calle' (Colon) y 'localidad' (CORDOBA); coincide con la demanda #323",
    )
  })

  it("también cubre la forma femenina y no depende del punto y coma", () => {
    expect(normalizeMatchDescription("Coincide el DNI vinculada a la demanda 8")).toBe(
      "Coincide el DNI; coincide con la demanda #8",
    )
  })

  it("deja igual los textos que no mencionan vinculación", () => {
    expect(normalizeMatchDescription("Coincide el DNI 30111222")).toBe("Coincide el DNI 30111222")
  })
})
