import { describe, expect, it } from "vitest"

import { calcularPlazoMedida } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/utils/plazo-medida"

const hoy = new Date(2026, 10, 3) // 03/11/2026

describe("calcularPlazoMedida", () => {
  it("cuenta los días desde la creación y los que quedan", () => {
    const p = calcularPlazoMedida("2026-10-27", hoy)
    expect(p).toMatchObject({ diasTranscurridos: 7, diasRestantes: 83, estado: "normal" })
  })

  it("avisa cuando quedan 30 días o menos", () => {
    expect(calcularPlazoMedida("2026-09-04", hoy)?.estado).toBe("warning") // 60 días, quedan 30
  })

  it("marca crítico cuando quedan 15 días o menos", () => {
    expect(calcularPlazoMedida("2026-08-20", hoy)?.estado).toBe("critical") // 75 días, quedan 15
  })

  it("marca vencido al pasar los 90 días y no deja días restantes negativos", () => {
    const p = calcularPlazoMedida("2026-07-01", hoy)
    expect(p).toMatchObject({ diasRestantes: 0, porcentaje: 100, estado: "exceeded" })
  })

  it("acepta una fecha con hora y no se corre de día", () => {
    expect(calcularPlazoMedida("2026-10-27T11:38:55.864299Z", hoy)?.diasTranscurridos).toBe(7)
  })

  it("devuelve null si no hay fecha válida", () => {
    expect(calcularPlazoMedida(null, hoy)).toBeNull()
    expect(calcularPlazoMedida("no es fecha", hoy)).toBeNull()
  })
})
