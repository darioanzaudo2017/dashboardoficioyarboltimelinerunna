import { describe, expect, it } from "vitest"

import { resolveResumeStep } from "@/components/forms/utils/draftStep"

describe("resolveResumeStep", () => {
  it("vuelve al paso guardado cuando existe", () => {
    expect(resolveResumeStep(2, 3)).toBe(2)
    expect(resolveResumeStep(1, 3)).toBe(1)
  })

  it("empieza por el primero si no hay paso guardado o es inválido", () => {
    expect(resolveResumeStep(null, 3)).toBe(0)
    expect(resolveResumeStep(-1, 3)).toBe(0)
    expect(resolveResumeStep(1.5, 3)).toBe(0)
    expect(resolveResumeStep(Number.NaN, 3)).toBe(0)
  })

  it("lo acota al último paso cuando el formulario tiene menos pasos que el borrador", () => {
    expect(resolveResumeStep(5, 3)).toBe(2)
    expect(resolveResumeStep(2, 1)).toBe(0)
  })

  it("no devuelve un paso negativo si no hay pasos", () => {
    expect(resolveResumeStep(2, 0)).toBe(0)
  })
})
