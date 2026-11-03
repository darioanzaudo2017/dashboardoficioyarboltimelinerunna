import { describe, expect, it } from "vitest"

import { formatDate } from "@/app/(runna)/legajo/actividades/components/UnifiedActividadesTable/utils"

describe("formatDate de actividades", () => {
  it("muestra el mismo día que manda el servidor para una fecha sin hora", () => {
    expect(formatDate("2026-11-03")).toMatch(/^03 nov/i)
    expect(formatDate("2026-12-01")).toMatch(/^01 dic/i)
  })

  it("devuelve N/A si no hay fecha", () => {
    expect(formatDate(null)).toBe("N/A")
    expect(formatDate(undefined)).toBe("N/A")
  })
})
