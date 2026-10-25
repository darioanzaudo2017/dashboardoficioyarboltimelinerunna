import { describe, expect, it } from "vitest"

import {
  buildInvalidFieldsMessage,
  buildVinculoProblemsMessage,
  describeVinculoProblems,
} from "@/components/forms/utils/formValidationFeedback"
import { dniFieldRules, phoneFieldRules } from "@/components/forms/utils/numberRules"

describe("buildInvalidFieldsMessage", () => {
  it("nombra el campo cuando falta uno solo", () => {
    expect(buildInvalidFieldsMessage(["Nombre"])).toBe("Falta completar o corregir 1 campo:\n• Nombre")
  })

  it("lista los campos y resume los que no entran", () => {
    const message = buildInvalidFieldsMessage(["A", "B", "C", "D", "E", "F", "G"])

    expect(message).toContain("Faltan completar o corregir 7 campos:")
    expect(message).toContain("• E")
    expect(message).not.toContain("• F")
    expect(message).toContain("• y 2 más")
  })

  it("da una pista genérica si no se pudo identificar ningún campo", () => {
    expect(buildInvalidFieldsMessage([])).toContain("marcados en rojo")
  })
})

describe("describeVinculoProblems", () => {
  it("indica qué le falta a cada vínculo y cuántos caracteres lleva la justificación", () => {
    const problems = describeVinculoProblems([
      { legajo: 174, tipo_vinculo: 20, justificacion: "x".repeat(30) },
      { legajo: null, tipo_vinculo: null, justificacion: "corta" },
    ])

    expect(problems).toEqual([
      "Vínculo 2: elegir el legajo, elegir el tipo de vínculo, justificación de al menos 20 caracteres (tiene 5)",
    ])
  })

  it("no cuenta los espacios de los bordes como caracteres de la justificación", () => {
    const problems = describeVinculoProblems([{ legajo: 1, tipo_vinculo: 1, justificacion: "   abc   " }])

    expect(problems[0]).toContain("(tiene 3)")
  })

  it("devuelve una lista vacía cuando todo está completo", () => {
    expect(describeVinculoProblems([{ legajo: 1, tipo_vinculo: 1, justificacion: "x".repeat(20) }])).toEqual([])
  })

  it("arma el mensaje con un punto por vínculo con problemas", () => {
    expect(buildVinculoProblemsMessage(["Vínculo 1: elegir el legajo"])).toBe(
      "Revisá los vínculos con legajos antes de guardar:\n• Vínculo 1: elegir el legajo",
    )
  })
})

describe("reglas de campos numéricos", () => {
  it("acepta vacío y números dentro del límite", () => {
    expect(phoneFieldRules.validate("")).toBe(true)
    expect(phoneFieldRules.validate(undefined)).toBe(true)
    expect(phoneFieldRules.validate("4512345")).toBe(true)
    expect(dniFieldRules.validate(2147483647)).toBe(true)
  })

  it("rechaza lo que el backend no puede guardar, con una pista según el campo", () => {
    expect(phoneFieldRules.validate("3511234567")).toContain("sin código de área")
    expect(dniFieldRules.validate("3511234567")).toContain("2.147.483.647")
  })

  it("rechaza decimales y negativos", () => {
    expect(phoneFieldRules.validate("12.5")).toContain("solo números")
    expect(phoneFieldRules.validate("-3")).toContain("solo números")
  })
})
