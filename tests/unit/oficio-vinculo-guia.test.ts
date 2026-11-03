import { describe, expect, it } from "vitest"

import { vinculoFieldErrors } from "@/components/forms/utils/formValidationFeedback"
import { mensajeDemandaGuardada } from "@/components/forms/utils/mensajeGuardado"

describe("vinculoFieldErrors", () => {
  it("marca cada campo faltante para mostrarlo debajo del campo", () => {
    expect(vinculoFieldErrors({ legajo: null, tipo_vinculo: null, justificacion: "corta" })).toEqual({
      legajo: "Elegí el legajo",
      tipo_vinculo: "Elegí el tipo de vínculo",
      justificacion: "Mínimo 20 caracteres (tiene 5)",
    })
  })

  it("no devuelve errores con el vínculo completo", () => {
    expect(vinculoFieldErrors({ legajo: 1, tipo_vinculo: 2, justificacion: "x".repeat(25) })).toEqual({})
  })

  it("en un oficio no pide justificación porque se completa sola", () => {
    expect(vinculoFieldErrors({ legajo: 1, tipo_vinculo: 2, justificacion: "" }, true)).toEqual({})
  })
})

describe("mensajeDemandaGuardada", () => {
  const medidas = [{ id: 7, numero_medida: "MED-2026-249" }]

  it("deja el mensaje de siempre fuera de un oficio de MPE/MPI vigente", () => {
    expect(mensajeDemandaGuardada({ objetivo_de_demanda: "CONSTATACION" }, true)).toBe("Demanda actualizada con éxito")
    expect(mensajeDemandaGuardada({ objetivo_de_demanda: "CONSTATACION" }, false)).toBe("Demanda creada con éxito")
  })

  it("dice en qué medida se agregan las actividades cuando hay vínculo con medida y tipo de oficio", () => {
    const mensaje = mensajeDemandaGuardada(
      {
        objetivo_de_demanda: "PETICION_DE_INFORME",
        tipo_oficio: 3,
        vinculos: [{ medida: 7, legajo_info: { medidas_activas: medidas } }],
      },
      true,
    )
    expect(mensaje).toBe("Demanda actualizada con éxito. Las actividades del oficio se agregan al plan de trabajo de MED-2026-249.")
  })

  it("avisa que no se agregaron actividades si falta el tipo de oficio", () => {
    const mensaje = mensajeDemandaGuardada(
      { objetivo_de_demanda: "PETICION_DE_INFORME", vinculos: [{ medida: 7, legajo_info: { medidas_activas: medidas } }] },
      true,
    )
    expect(mensaje).toContain("No se agregaron actividades")
  })

  it("no dice nada de actividades si no hay vínculo con una medida", () => {
    expect(mensajeDemandaGuardada({ objetivo_de_demanda: "PETICION_DE_INFORME", tipo_oficio: 3, vinculos: [] }, false)).toBe(
      "Demanda creada con éxito",
    )
  })
})
