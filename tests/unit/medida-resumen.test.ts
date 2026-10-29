import { describe, expect, it } from "vitest"

import {
  otrasVigentesDelMismoTipo,
  resumirActividades,
} from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/legajo/medida-resumen"

const hoy = new Date(2026, 9, 29) // 29/10/2026

describe("resumirActividades", () => {
  it("cuenta cada estado por separado", () => {
    const r = resumirActividades(
      [
        { estado: "COMPLETADA", actor: "EQUIPO_TECNICO" },
        { estado: "VISADO_APROBADO", actor: "EQUIPO_LEGAL" },
        { estado: "PENDIENTE_VISADO", actor: "EQUIPO_TECNICO" },
        { estado: "EN_PROGRESO", actor: "EQUIPO_TECNICO" },
        { estado: "PENDIENTE", actor: "EQUIPOS_RESIDENCIALES" },
        { estado: "VENCIDA", actor: "EQUIPO_TECNICO" },
        { estado: "CANCELADA", actor: "EQUIPO_TECNICO" },
      ],
      hoy,
    )

    expect(r).toMatchObject({ total: 7, realizadas: 2, porVisar: 1, enProgreso: 1, pendientes: 1, pendientesEnPlazo: 1, vencidas: 1, canceladas: 1 })
  })

  it("cuenta una pendiente con fecha pasada como pendiente y como vencida (igual que el tablero del plan)", () => {
    const r = resumirActividades([{ estado: "PENDIENTE", esta_vencida: true }], hoy)

    expect(r).toMatchObject({ pendientes: 1, vencidas: 1, pendientesEnPlazo: 0 })
  })

  it("deja en progreso a una actividad en progreso aunque tenga la fecha pasada", () => {
    const r = resumirActividades([{ estado: "EN_PROGRESO", esta_vencida: true }], hoy)

    expect(r).toMatchObject({ enProgreso: 1, vencidas: 0 })
  })

  it("cada actividad cae en un solo tramo de la barra", () => {
    const r = resumirActividades(
      [
        { estado: "COMPLETADA" },
        { estado: "PENDIENTE_VISADO" },
        { estado: "EN_PROGRESO", esta_vencida: true },
        { estado: "PENDIENTE" },
        { estado: "PENDIENTE", esta_vencida: true },
        { estado: "VENCIDA" },
        { estado: "CANCELADA" },
      ],
      hoy,
    )

    const enBarra = r.realizadas + r.porVisar + r.enProgreso + r.pendientesEnPlazo + r.vencidas + r.canceladas
    expect(enBarra).toBe(r.total)
  })

  it("calcula el avance sobre el total, como el tablero del plan", () => {
    const r = resumirActividades(
      [{ estado: "COMPLETADA" }, { estado: "PENDIENTE" }, { estado: "CANCELADA" }, { estado: "CANCELADA" }],
      hoy,
    )

    expect(r.avance).toBe(25)
  })

  it("da avance 0 cuando no hay actividades", () => {
    expect(resumirActividades([], hoy)).toMatchObject({ total: 0, avance: 0, ultimaRealizada: null, proxima: null })
  })

  it("agrupa por equipo con nombres legibles", () => {
    const r = resumirActividades(
      [{ estado: "PENDIENTE", actor: "EQUIPO_TECNICO" }, { estado: "PENDIENTE", actor: "EQUIPO_TECNICO" }, { estado: "PENDIENTE", actor: "EQUIPO_LEGAL" }],
      hoy,
    )

    expect(r.porEquipo).toEqual({ Técnico: 2, Legal: 1 })
  })

  it("elige como última la realizada más reciente", () => {
    const r = resumirActividades(
      [
        { estado: "COMPLETADA", fecha_finalizacion_real: "2026-10-01T10:00:00Z", subtipo_actividad_info: { nombre: "Informe social" }, actor: "EQUIPO_TECNICO" },
        { estado: "COMPLETADA", fecha_finalizacion_real: "2026-10-20T10:00:00Z", subtipo_actividad_info: { nombre: "Visita domiciliaria" }, actor: "EQUIPO_TECNICO" },
      ],
      hoy,
    )

    expect(r.ultimaRealizada).toEqual({ fecha: "2026-10-20T10:00:00Z", titulo: "Visita domiciliaria", actor: "Técnico" })
  })

  it("elige como próxima la planificada más cercana desde hoy e ignora las pasadas y las vencidas", () => {
    const r = resumirActividades(
      [
        { estado: "PENDIENTE", fecha_planificacion: "2026-10-10", subtipo_actividad_info: { nombre: "Pasada" } },
        { estado: "PENDIENTE", fecha_planificacion: "2026-11-20", subtipo_actividad_info: { nombre: "Lejana" } },
        { estado: "PENDIENTE", fecha_planificacion: "2026-11-05", subtipo_actividad_info: { nombre: "Cercana" } },
        { estado: "PENDIENTE", fecha_planificacion: "2026-11-01", esta_vencida: true, subtipo_actividad_info: { nombre: "Vencida" } },
        { estado: "COMPLETADA", fecha_planificacion: "2026-10-30", subtipo_actividad_info: { nombre: "Hecha" } },
      ],
      hoy,
    )

    expect(r.proxima?.titulo).toBe("Cercana")
  })

  it("usa el tipo de actividad cuando no hay subtipo", () => {
    const r = resumirActividades([{ estado: "PENDIENTE", fecha_planificacion: "2026-11-05", tipo_actividad_info: { nombre: "Derecho a la familia" } }], hoy)

    expect(r.proxima?.titulo).toBe("Derecho a la familia")
  })
})

describe("otrasVigentesDelMismoTipo", () => {
  const medidas = [
    { id: 249, numero_medida: "MED-2026-249", tipo_medida: "MPE", estado_vigencia: "VIGENTE" },
    { id: 251, numero_medida: "MED-2026-251", tipo_medida: "MPE", estado_vigencia: "VIGENTE" },
    { id: 238, numero_medida: "MED-2026-238", tipo_medida: "MPI", estado_vigencia: "CERRADA" },
    { id: 240, numero_medida: "MED-2026-240", tipo_medida: "MPJ", estado_vigencia: "VIGENTE" },
  ]

  it("avisa de la otra medida vigente del mismo tipo", () => {
    expect(otrasVigentesDelMismoTipo(medidas[0], medidas)).toEqual(["MED-2026-251"])
  })

  it("no avisa si es la única vigente de su tipo", () => {
    expect(otrasVigentesDelMismoTipo(medidas[3], medidas)).toEqual([])
  })

  it("no avisa para una medida cerrada", () => {
    expect(otrasVigentesDelMismoTipo(medidas[2], medidas)).toEqual([])
  })
})
