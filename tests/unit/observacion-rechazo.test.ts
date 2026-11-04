import { describe, expect, it } from "vitest"

import { observacionDeRechazo } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/utils/observacion-rechazo"

describe("observacionDeRechazo (aviso del rechazo para el técnico)", () => {
  it("con la intervención rechazada devuelve lo que escribió el Jefe Zonal", () => {
    expect(observacionDeRechazo({ estado: "RECHAZADO", observaciones_jz: "Falta detallar el plan." })).toBe("Falta detallar el plan.")
  })

  it("si el técnico la guardó como borrador después del rechazo, la observación sigue vigente", () => {
    expect(observacionDeRechazo({ estado: "BORRADOR", observaciones_jz: "Falta detallar el plan." })).toBe("Falta detallar el plan.")
  })

  it("una vez reenviada o aprobada, la observación vieja ya no se muestra", () => {
    expect(observacionDeRechazo({ estado: "ENVIADO", observaciones_jz: "Falta detallar el plan." })).toBeNull()
    expect(observacionDeRechazo({ estado: "APROBADO", observaciones_jz: "Falta detallar el plan." })).toBeNull()
  })

  it("sin observación, o solo con espacios, no hay nada que mostrar", () => {
    expect(observacionDeRechazo({ estado: "RECHAZADO", observaciones_jz: null })).toBeNull()
    expect(observacionDeRechazo({ estado: "RECHAZADO", observaciones_jz: "   " })).toBeNull()
    expect(observacionDeRechazo(undefined)).toBeNull()
  })
})
