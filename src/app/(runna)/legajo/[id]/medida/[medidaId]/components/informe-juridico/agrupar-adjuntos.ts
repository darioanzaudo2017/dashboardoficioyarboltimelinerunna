import type { AdjuntoIntervencion } from "../../types/intervencion-api"

const ORDEN_TIPOS: AdjuntoIntervencion["tipo"][] = ["INFORME", "ACTA", "RESPALDO", "MODELO"]

const TITULO_POR_TIPO: Record<AdjuntoIntervencion["tipo"], string> = {
  INFORME: "Informe obligatorio",
  ACTA: "Notificaciones y actas",
  RESPALDO: "Documentación complementaria",
  MODELO: "Otros documentos",
}

/** Agrupa por tipo en el orden en que el técnico los carga (primero el informe obligatorio). */
export const agruparAdjuntosPorTipo = (adjuntos: AdjuntoIntervencion[]) =>
  ORDEN_TIPOS.map((tipo) => ({ tipo, titulo: TITULO_POR_TIPO[tipo], adjuntos: adjuntos.filter((a) => a.tipo === tipo) })).filter(
    (grupo) => grupo.adjuntos.length > 0,
  )
