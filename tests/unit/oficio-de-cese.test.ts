import { describe, expect, it } from "vitest"

import { esCategoriaDeCese } from "@/components/forms/carga-oficios/utils/oficioDeCese"

describe("esCategoriaDeCese", () => {
  it("reconoce las categorías de cese del catálogo", () => {
    expect(esCategoriaDeCese("CESE MEDIDAS TUTELARES PROVISORIAS")).toBe(true)
    expect(esCategoriaDeCese("CESE MEDIDA TUTELAR INICIAL")).toBe(true)
    expect(esCategoriaDeCese("CESE DE CAUSA PENAL JUVENIL")).toBe(true)
    expect(esCategoriaDeCese("  cese de periodo de probacion")).toBe(true)
  })

  it("no confunde otras categorías, aunque mencionen un cese o un levantamiento", () => {
    expect(esCategoriaDeCese("MEDIDA TUTELAR INICIAL")).toBe(false)
    expect(esCategoriaDeCese("REQUERIMIENTO JUDICIAL")).toBe(false)
    expect(esCategoriaDeCese("PERMISOS")).toBe(false)
    expect(esCategoriaDeCese("CESEDERA")).toBe(false)
  })

  it("devuelve false si no hay categoría", () => {
    expect(esCategoriaDeCese(null)).toBe(false)
    expect(esCategoriaDeCese(undefined)).toBe(false)
    expect(esCategoriaDeCese("")).toBe(false)
  })
})
