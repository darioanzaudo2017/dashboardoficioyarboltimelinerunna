import { describe, expect, it } from "vitest"

import {
  contarSinReasignar,
  demandaGeneraActividadesDeOficio,
  filtrarActividadesDeDemanda,
} from "@/app/(runna)/mesadeentrada/utils/actividadesDeOficio"

describe("demandaGeneraActividadesDeOficio", () => {
  it("reconoce la carga de oficios y el pedido de informe", () => {
    expect(demandaGeneraActividadesDeOficio("CARGA_OFICIOS")).toBe(true)
    expect(demandaGeneraActividadesDeOficio("PETICION_DE_INFORME")).toBe(true)
  })

  it("no aplica a una demanda de protección ni sin objetivo", () => {
    expect(demandaGeneraActividadesDeOficio("PROTECCION")).toBe(false)
    expect(demandaGeneraActividadesDeOficio("CONSTATACION")).toBe(false)
    expect(demandaGeneraActividadesDeOficio(null)).toBe(false)
    expect(demandaGeneraActividadesDeOficio(undefined)).toBe(false)
  })
})

describe("filtrarActividadesDeDemanda", () => {
  const actividades = [
    { id: 1, oficio_origen: { id: 328 } },
    { id: 2, oficio_origen: { id: 328 } },
    { id: 3, oficio_origen: { id: 200 } },
    { id: 4, oficio_origen: null },
    { id: 5 },
  ]

  it("deja solo las de la demanda pedida", () => {
    expect(filtrarActividadesDeDemanda(actividades, 328).map((a) => a.id)).toEqual([1, 2])
  })

  it("devuelve vacío si la demanda no generó actividades", () => {
    expect(filtrarActividadesDeDemanda(actividades, 999)).toEqual([])
  })
})

describe("contarSinReasignar", () => {
  it("cuenta las que siguen a nombre de quien cargó el oficio", () => {
    expect(
      contarSinReasignar([
        { responsable_principal: 1, usuario_creacion: 1, responsables_secundarios: [] },
        { responsable_principal: 1, usuario_creacion: 1 },
      ]),
    ).toBe(2)
  })

  it("no cuenta las que ya tienen otro responsable principal", () => {
    expect(contarSinReasignar([{ responsable_principal: 64, usuario_creacion: 1, responsables_secundarios: [] }])).toBe(0)
  })

  it("no cuenta las que tienen responsables secundarios", () => {
    expect(contarSinReasignar([{ responsable_principal: 1, usuario_creacion: 1, responsables_secundarios: [64] }])).toBe(0)
  })

  it("cuenta las que no tienen ningún responsable", () => {
    expect(contarSinReasignar([{ responsable_principal: null, responsables_secundarios: [] }])).toBe(1)
  })
})
