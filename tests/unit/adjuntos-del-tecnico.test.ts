import { describe, expect, it } from "vitest"

import { agruparAdjuntosPorTipo } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/informe-juridico/agrupar-adjuntos"
import type { AdjuntoIntervencion } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/types/intervencion-api"

const adjunto = (id: number, tipo: AdjuntoIntervencion["tipo"]) => ({ id, tipo }) as AdjuntoIntervencion

describe("agruparAdjuntosPorTipo", () => {
  it("pone primero el informe obligatorio y luego actas, documentación complementaria y otros", () => {
    const grupos = agruparAdjuntosPorTipo([adjunto(1, "RESPALDO"), adjunto(2, "INFORME"), adjunto(3, "ACTA"), adjunto(4, "RESPALDO")])

    expect(grupos.map((g) => g.titulo)).toEqual(["Informe obligatorio", "Notificaciones y actas", "Documentación complementaria"])
    expect(grupos[2].adjuntos.map((a) => a.id)).toEqual([1, 4])
  })

  it("no muestra los tipos que no tienen archivos", () => {
    expect(agruparAdjuntosPorTipo([adjunto(1, "INFORME")])).toHaveLength(1)
    expect(agruparAdjuntosPorTipo([])).toEqual([])
  })
})
