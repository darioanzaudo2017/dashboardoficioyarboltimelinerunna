import { describe, expect, it } from "vitest"

import { describirHallazgos, personasConMismoDni } from "@/components/evaluacion/utils/chequeoLegajoMedidas"

const franco = { id: 341, nombre: "franco colapinto", dni: 31452587 }

describe("describirHallazgos", () => {
  it("avisa del legajo y de las medidas vigentes cuando el NNyA ya tiene legajo", () => {
    const encontradas = [{ id: 341, dni: 31452587, legajo: { id: 176, numero: "LEG-2026-0176" } }]
    const medidas = { 176: [{ id: 249, numero_medida: "MED-2026-249", tipo_medida: "MPE" }] }

    expect(describirHallazgos(franco, encontradas, medidas)).toEqual([
      "franco colapinto ya tiene el legajo LEG-2026-0176 con 1 medida vigente: MED-2026-249 (MPE).",
    ])
  })

  it("cuenta varias medidas vigentes", () => {
    const encontradas = [{ id: 341, dni: 31452587, legajo: { id: 176, numero: "LEG-2026-0176" } }]
    const medidas = {
      176: [
        { id: 251, numero_medida: "MED-2026-251", tipo_medida: "MPE" },
        { id: 249, numero_medida: "MED-2026-249", tipo_medida: "MPE" },
      ],
    }

    expect(describirHallazgos(franco, encontradas, medidas)[0]).toContain("con 2 medidas vigentes: MED-2026-251 (MPE), MED-2026-249 (MPE)")
  })

  it("avisa cuando el legajo existe pero no tiene medidas vigentes", () => {
    const encontradas = [{ id: 341, dni: 31452587, legajo: { id: 176, numero: "LEG-2026-0176" } }]

    expect(describirHallazgos(franco, encontradas, { 176: [] })).toEqual(["franco colapinto ya tiene el legajo LEG-2026-0176."])
  })

  it("detecta otro registro con el mismo DNI que ya tiene legajo (el caso de la persona duplicada)", () => {
    const persona = { id: 348, nombre: "franco colapinto", dni: 31452587 }
    const encontradas = [
      { id: 348, dni: 31452587, legajo: null },
      { id: 341, dni: 31452587, legajo: { id: 176, numero: "LEG-2026-0176" } },
    ]
    const medidas = { 176: [{ id: 249, numero_medida: "MED-2026-249", tipo_medida: "MPE" }] }

    const lineas = describirHallazgos(persona, encontradas, medidas)

    expect(lineas).toHaveLength(1)
    expect(lineas[0]).toContain("hay otro registro con el mismo DNI (31452587) que ya tiene el legajo LEG-2026-0176")
    expect(lineas[0]).toContain("1 medida vigente: MED-2026-249 (MPE)")
    expect(lineas[0]).toContain("conviene vincular la demanda a ese legajo")
  })

  it("marca como posible duplicado a otro registro con el mismo DNI sin legajo", () => {
    const encontradas = [
      { id: 341, dni: 31452587, legajo: null },
      { id: 348, dni: 31452587, legajo: null },
    ]

    expect(describirHallazgos(franco, encontradas, {})).toEqual([
      "franco colapinto: hay otro registro cargado con el mismo DNI (31452587) y sin legajo. Puede ser una persona duplicada.",
    ])
  })

  it("no devuelve nada si el NNyA es el único registro y no tiene legajo", () => {
    expect(describirHallazgos(franco, [{ id: 341, dni: 31452587, legajo: null }], {})).toEqual([])
  })

  it("avisa que no pudo comprobar cuando no hay DNI", () => {
    const lineas = describirHallazgos({ id: 1, nombre: "sin dni", dni: null }, [], {})

    expect(lineas).toHaveLength(1)
    expect(lineas[0]).toContain("no tiene DNI cargado")
  })

  it("ignora a las personas con otro DNI", () => {
    const encontradas = [
      { id: 341, dni: 31452587, legajo: null },
      { id: 999, dni: 11111111, legajo: { id: 5, numero: "LEG-2026-0005" } },
    ]

    expect(describirHallazgos(franco, encontradas, {})).toEqual([])
    expect(personasConMismoDni(franco, encontradas).map((p) => p.id)).toEqual([341])
  })
})
