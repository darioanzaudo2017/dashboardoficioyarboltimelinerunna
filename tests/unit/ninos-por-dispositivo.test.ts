import { describe, expect, it } from "vitest"

import { contarNinosPorDispositivo, SIN_DISPOSITIVO } from "@/app/(runna)/dispositivos/lib/contar-por-dispositivo"

const medida = (id: number, extra: Record<string, unknown> = {}) =>
  ({
    id,
    numeroMedida: `MED-${id}`,
    numeroLegajo: `LEG-${id}`,
    tipoMedida: "MPE",
    estadoVigencia: "VIGENTE",
    estaCerrada: false,
    nnyaId: id,
    zona: "ZONA 1",
    tipoDispositivo: "Centro de Cuidado Residencial",
    subtipoDispositivo: "Alfonsina Storni",
    ...extra,
  }) as Parameters<typeof contarNinosPorDispositivo>[0][number]

describe("contarNinosPorDispositivo", () => {
  it("cuenta los niños por tipo de dispositivo y por institución", () => {
    const { dispositivos, totalNinos } = contarNinosPorDispositivo([
      medida(1),
      medida(2),
      medida(3, { subtipoDispositivo: "Hogar Esperanza" }),
      medida(4, { tipoDispositivo: "Familia ampliada", subtipoDispositivo: "Tía" }),
    ])

    expect(totalNinos).toBe(4)
    expect(dispositivos[0].tipo).toBe("Centro de Cuidado Residencial")
    expect(dispositivos[0].ninos).toBe(3)
    expect(dispositivos[0].instituciones.map((i) => [i.nombre, i.ninos])).toEqual([
      ["Alfonsina Storni", 2],
      ["Hogar Esperanza", 1],
    ])
  })

  it("un niño con dos medidas vigentes en el mismo dispositivo cuenta una vez", () => {
    const { dispositivos, totalNinos, totalMedidas } = contarNinosPorDispositivo([medida(1, { nnyaId: 7 }), medida(2, { nnyaId: 7 })])

    expect(dispositivos[0].ninos).toBe(1)
    expect(totalNinos).toBe(1)
    expect(totalMedidas).toBe(2)
  })

  it("ignora las medidas cerradas", () => {
    const { totalNinos } = contarNinosPorDispositivo([medida(1), medida(2, { estadoVigencia: "CERRADA", estaCerrada: true })])
    expect(totalNinos).toBe(1)
  })

  it("agrupa lo que no tiene dispositivo y lo deja al final", () => {
    const { dispositivos } = contarNinosPorDispositivo([medida(1, { tipoDispositivo: null, subtipoDispositivo: null }), medida(2), medida(3)])
    expect(dispositivos.map((d) => d.tipo)).toEqual(["Centro de Cuidado Residencial", SIN_DISPOSITIVO])
  })

  it("filtra por tipo de medida, zona y texto", () => {
    const lista = [medida(1), medida(2, { tipoMedida: "MPJ" }), medida(3, { zona: "ZONA 2" })]
    expect(contarNinosPorDispositivo(lista, { tipoMedida: "MPJ" }).totalNinos).toBe(1)
    expect(contarNinosPorDispositivo(lista, { zona: "ZONA 2" }).totalNinos).toBe(1)
    expect(contarNinosPorDispositivo(lista, { texto: "storni" }).totalNinos).toBe(3)
    expect(contarNinosPorDispositivo(lista, { texto: "no existe" }).totalNinos).toBe(0)
  })
})
