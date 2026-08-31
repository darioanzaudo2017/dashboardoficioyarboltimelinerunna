import { describe, expect, it } from "vitest"

import {
  calculateAge,
  formatDateLocaleAR,
  isValidDate,
  parseISODate,
} from "@/utils/dateUtils"

describe("dateUtils", () => {
  it("preserva el día calendario de una fecha sin hora", () => {
    expect(formatDateLocaleAR("2025-12-25")).toBe("25/12/2025")

    const date = parseISODate("2025-12-25")
    expect(date.getFullYear()).toBe(2025)
    expect(date.getMonth()).toBe(11)
    expect(date.getDate()).toBe(25)
  })

  it("rechaza fechas calendario inexistentes y valores vacíos", () => {
    expect(isValidDate("2024-02-29")).toBe(true)
    expect(isValidDate("2025-02-29")).toBe(false)
    expect(isValidDate("2025-04-31")).toBe(false)
    expect(isValidDate(" ")).toBe(false)
  })

  it("acepta timestamps ISO válidos", () => {
    expect(isValidDate("2025-12-25T14:30:00Z")).toBe(true)
    expect(isValidDate("fecha-invalida")).toBe(false)
  })

  it("calcula edades sin mostrar valores negativos o inverosímiles", () => {
    const referenceDate = new Date(2026, 7, 30)

    expect(calculateAge("2010-09-01", referenceDate)).toBe(15)
    expect(calculateAge("2010-08-30", referenceDate)).toBe(16)
    expect(calculateAge("9174-08-09", referenceDate)).toBeNull()
    expect(calculateAge("1800-01-01", referenceDate)).toBeNull()
  })
})
