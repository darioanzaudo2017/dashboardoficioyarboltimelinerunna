import { describe, expect, it } from "vitest"

import { estadoLegible } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/utils/estado-legible"

describe("estadoLegible", () => {
  it("usa el nombre del servidor cuando viene", () => {
    expect(estadoLegible("PENDIENTE_REGISTRO_INTERVENCION", "(1) Pendiente de registro de intervención")).toBe(
      "(1) Pendiente de registro de intervención",
    )
  })

  it("convierte el código en una frase cuando no hay nombre", () => {
    expect(estadoLegible("PENDIENTE_REGISTRO_INTERVENCION")).toBe("Pendiente registro intervención")
  })

  it("restaura las tildes de las palabras conocidas", () => {
    expect(estadoLegible("PENDIENTE_APROBACION_JURIDICO")).toBe("Pendiente aprobación jurídico")
  })

  it("ignora un nombre vacío", () => {
    expect(estadoLegible("ENVIADO", "  ")).toBe("Enviado")
  })

  it("devuelve vacío si no hay nada", () => {
    expect(estadoLegible(undefined, null)).toBe("")
    expect(estadoLegible("")).toBe("")
  })
})
