import { describe, expect, it } from "vitest"

import {
  normalizedLevenshteinDistance,
  normalizeForComparison,
} from "@/components/forms/utils/levenshtein"
import {
  requiresDuplicateCheck,
  validateDNI,
  validateJustification,
  validateSearchMinimumData,
} from "@/components/forms/utils/duplicate-detection-validator"

describe("detección de legajos duplicados", () => {
  it("normaliza mayúsculas, acentos y espacios antes de comparar", () => {
    expect(normalizeForComparison("  María   José ")).toBe("maria jose")
    expect(normalizedLevenshteinDistance("María", "maria")).toBe(0)
  })

  it("exige nombre y apellido útiles para iniciar una búsqueda", () => {
    expect(validateSearchMinimumData({ nombre: " ", apellido: "P" })).toEqual({
      isValid: false,
      errors: [
        "El nombre es obligatorio para buscar duplicados",
        "El apellido debe tener al menos 2 caracteres",
      ],
    })
  })

  it("valida el rango de DNI argentino utilizado por el formulario", () => {
    expect(validateDNI(1234567)).toBe(true)
    expect(validateDNI(12345678)).toBe(true)
    expect(validateDNI(123456)).toBe(false)
    expect(validateDNI(null)).toBe(false)
  })

  it("permite continuar sólo con una justificación completa", () => {
    expect(validateJustification(" motivo breve ")).toMatchObject({
      isValid: false,
      charactersLeft: 8,
    })
    expect(validateJustification("Se verificó el legajo con documentación oficial.")).toEqual({
      isValid: true,
      error: null,
      charactersLeft: 0,
    })
  })

  it("omite la búsqueda cuando el NNyA ya fue vinculado o justificado", () => {
    expect(requiresDuplicateCheck({ nombre: "Ana", apellido: "Pérez" })).toBe(true)
    expect(
      requiresDuplicateCheck({
        nombre: "Ana",
        apellido: "Pérez",
        legajo_existente_vinculado: {
          legajo_id: 123,
          legajo_numero: "LEG-2026-0123",
          fue_vinculado: true,
        },
      })
    ).toBe(false)
    expect(
      requiresDuplicateCheck({
        nombre: "Ana",
        apellido: "Pérez",
        skip_duplicate_check: true,
      })
    ).toBe(false)
  })
})
