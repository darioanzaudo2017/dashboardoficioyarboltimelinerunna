import { describe, expect, it } from "vitest"

import { actividadRequiereVisado } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/utils/actividad-visado"

describe("actividadRequiereVisado (aviso de visado al completar una actividad)", () => {
  it("si el subtipo tiene el visado tildado, lo requiere", () => {
    expect(
      actividadRequiereVisado({
        subtipo_actividad_info: { requiere_visado_legales: true },
        tipo_actividad_info: { requiere_visado_legales: false },
      }),
    ).toBe(true)
  })

  it("si el tipo lo tiene tildado pero el subtipo no, NO lo requiere (caso de Derecho a la salud / vacunación)", () => {
    expect(
      actividadRequiereVisado({
        subtipo_actividad_info: { requiere_visado_legales: false },
        tipo_actividad_info: { requiere_visado_legales: true },
      }),
    ).toBe(false)
  })

  it("sin subtipo se mira el tipo", () => {
    expect(actividadRequiereVisado({ tipo_actividad_info: { requiere_visado_legales: true } })).toBe(true)
    expect(actividadRequiereVisado({ subtipo_actividad_info: null, tipo_actividad_info: { requiere_visado_legales: false } })).toBe(false)
  })

  it("sin datos no requiere visado", () => {
    expect(actividadRequiereVisado(undefined)).toBe(false)
    expect(actividadRequiereVisado({})).toBe(false)
  })
})
