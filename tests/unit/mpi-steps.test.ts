import { describe, expect, it } from "vitest"

import { getMpiStepsCompletion } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/utils/mpi-steps"

describe("getMpiStepsCompletion (pasos del modal de la MPI)", () => {
  it("con la intervención aprobada y el plan de trabajo corriendo, el Seguimiento no figura completado", () => {
    expect(getMpiStepsCompletion("PENDIENTE_DE_INFORME_DE_CIERRE")).toEqual({
      seguimientoCompletado: false,
      cierreCompletado: false,
    })
  })

  it.each(["INFORME_DE_CIERRE_REDACTADO", "CERRADA"])("con %s, Seguimiento y Cierre están completados", (estado) => {
    expect(getMpiStepsCompletion(estado)).toEqual({ seguimientoCompletado: true, cierreCompletado: true })
  })

  it.each(["PENDIENTE_REGISTRO_INTERVENCION", "PENDIENTE_APROBACION_REGISTRO", null, undefined])(
    "antes de aprobar (%s) nada de lo posterior está completado",
    (estado) => {
      expect(getMpiStepsCompletion(estado)).toEqual({ seguimientoCompletado: false, cierreCompletado: false })
    },
  )
})
