"use client"

/**
 * Arma la línea de tiempo única del árbol de la medida: junta los registros
 * de las 5 grandes secciones (Registro de la Medida, Proceso de la Medida,
 * Plan de Trabajo, Control de Legalidad, Informes Mensuales) en una sola
 * lista ordenada de más viejo a más nuevo, en vez de 5 bloques de página
 * separados — así se ve realmente qué pasó primero y qué después, sin
 * importar a qué módulo pertenece cada cosa.
 *
 * Cada registro conserva su módulo y (si corresponde) su etapa como
 * etiquetas, no como agrupador estructural: eso es lo que decidimos con el
 * usuario para no perder el orden cronológico real entre módulos.
 */
import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import {
  useHistorialSeguimiento,
  useTrazabilidadEtapas,
} from "../../../hooks/useHistorialSeguimiento"
import { useMedidaDetail } from "../../../hooks/useMedidaDetail"
import { useActividadStats } from "../../../hooks/useActividadStats"
import { useInformesSeguimiento } from "../../../hooks/useInformesSeguimiento"
import { getEtapaDetail } from "../../../api/etapa-detail-api-service"
import type { EtapaDetailResponse } from "../../../api/etapa-detail-api-service"
import { getCategoriaFromTipoEvento } from "../../../types/historial-seguimiento-api"
import type { CategoriaEvento, HistorialEventoItem } from "../../../types/historial-seguimiento-api"
import { HistorialEventCard } from "../historial/historial-event-card"
import {
  IntervencionDocCard,
  NotaAvalDocCard,
  InformeJuridicoDocCard,
  RatificacionDocCard,
} from "./documento-cards"
import { ActividadNode } from "./actividad-node"
import { InformeMensualCard } from "./informe-mensual-card"
import type { ItemLineaTiempo, ModuloArbol } from "./modulo-config"

// Traer todos los eventos de una sola vez: la línea de tiempo necesita el
// set completo (no paginado) para poder mezclar y ordenar todo junto.
const PAGE_SIZE_COMPLETO = 1000

// Estas categorías del historial de seguimiento ya se muestran con datos
// reales y más completos desde otro módulo (ver comentario de archivo), así
// que se excluyen acá para no duplicar la misma información con menos detalle.
const CATEGORIAS_CUBIERTAS_POR_OTRO_MODULO = new Set<CategoriaEvento>([
  "INTERVENCION",
  "ACTIVIDAD",
  "INFORME",
])

const esEventoCubiertoPorOtroModulo = (evento: HistorialEventoItem): boolean =>
  CATEGORIAS_CUBIERTAS_POR_OTRO_MODULO.has(getCategoriaFromTipoEvento(evento.tipo_evento)) ||
  evento.tipo_evento === "ESTADO_TRANSICION"

const MODULO_POR_CATEGORIA_RESIDUAL: Record<CategoriaEvento, ModuloArbol> = {
  MEDIDA: "REGISTRO_MEDIDA",
  ETAPA: "PROCESO_MEDIDA",
  SEGUIMIENTO: "SEGUIMIENTO",
  OFICIO: "OFICIOS",
  MANUAL: "MANUAL",
  // No deberían aparecer (ya excluidas arriba), pero TS exige exhaustividad.
  INTERVENCION: "PROCESO_MEDIDA",
  ACTIVIDAD: "PLAN_TRABAJO",
  INFORME: "INFORMES_MENSUALES",
}

interface UseLineaTiempoMedidaParams {
  medidaId: number
  legajoId?: number
  enabled?: boolean
}

export function useLineaTiempoMedida({ medidaId, legajoId, enabled = true }: UseLineaTiempoMedidaParams) {
  const trazabilidad = useTrazabilidadEtapas({ medidaId, enabled })

  const historial = useHistorialSeguimiento({
    medidaId,
    params: { page_size: PAGE_SIZE_COMPLETO },
    enabled,
  })

  const medidaDetail = useMedidaDetail(medidaId, { enabled, legajoId })
  const planTrabajoId = medidaDetail.data?.plan_trabajo_id ?? undefined
  const { actividades, isLoading: isLoadingActividades } = useActividadStats(planTrabajoId, legajoId)

  const informes = useInformesSeguimiento({ medidaId, enabled })

  const etapasTimeline = trazabilidad.data?.etapas_timeline ?? []

  // Documentos reales (intervención, nota de aval, informe jurídico,
  // ratificación) de CADA etapa, en paralelo — ya no se piden solo al
  // expandir, porque ahora todos aportan registros a la misma línea de tiempo.
  const documentosPorEtapa = useQueries({
    queries: etapasTimeline.map((etapa) => ({
      queryKey: ["arbol-etapa-detail", medidaId, etapa.tipo_etapa, etapa.id, legajoId],
      queryFn: (): Promise<EtapaDetailResponse | null> =>
        getEtapaDetail(medidaId, etapa.tipo_etapa, etapa.id, legajoId),
      enabled: enabled && !!medidaId && !!etapa.id,
      staleTime: 1000 * 60 * 2,
    })),
  })

  const isLoading =
    trazabilidad.isLoading ||
    historial.isLoading ||
    isLoadingActividades ||
    informes.isLoading ||
    documentosPorEtapa.some((q) => q.isLoading)

  const error = trazabilidad.error ?? historial.error ?? null

  const items = useMemo<ItemLineaTiempo[]>(() => {
    const lista: ItemLineaTiempo[] = []

    // 1) Eventos del historial de seguimiento no cubiertos por otro módulo
    //    (registro de la medida, ciclo de vida de etapas, seguimiento en
    //    dispositivo, oficios, eventos manuales).
    for (const evento of historial.data?.results ?? []) {
      if (esEventoCubiertoPorOtroModulo(evento)) continue
      const categoria = getCategoriaFromTipoEvento(evento.tipo_evento)
      lista.push({
        id: `hist-${evento.id}`,
        fecha: evento.fecha_evento,
        modulo: MODULO_POR_CATEGORIA_RESIDUAL[categoria],
        etapaLabel: evento.etapa?.tipo_etapa_display,
        render: () => <HistorialEventCard evento={evento} />,
      })
    }

    // 2) Documentos reales de cada etapa del Proceso de la Medida.
    etapasTimeline.forEach((etapa, idx) => {
      const documentos = documentosPorEtapa[idx]?.data?.etapa.documentos
      if (!documentos) return
      const etapaLabel = etapa.tipo_etapa_display

      for (const i of documentos.intervenciones) {
        lista.push({
          id: `int-${i.id}`,
          fecha: i.fecha_creacion,
          modulo: "PROCESO_MEDIDA",
          etapaLabel,
          render: () => <IntervencionDocCard medidaId={medidaId} intervencion={i} />,
        })
      }
      for (const n of documentos.notas_aval) {
        lista.push({
          id: `nota-${n.id}`,
          fecha: n.fecha_emision,
          modulo: "PROCESO_MEDIDA",
          etapaLabel,
          render: () => <NotaAvalDocCard medidaId={medidaId} nota={n} />,
        })
      }
      for (const inf of documentos.informes_juridicos) {
        lista.push({
          id: `inf-${inf.id}`,
          fecha: inf.fecha_envio ?? inf.fecha_notificaciones,
          modulo: "PROCESO_MEDIDA",
          etapaLabel,
          render: () => <InformeJuridicoDocCard medidaId={medidaId} informe={inf} />,
        })
      }
      for (const r of documentos.ratificaciones) {
        lista.push({
          id: `rat-${r.id}`,
          fecha: r.fecha_registro,
          modulo: "PROCESO_MEDIDA",
          etapaLabel,
          render: () => <RatificacionDocCard ratificacion={r} />,
        })
      }
    })

    // 3) Actividades: Plan de Trabajo o Control de Legalidad según el actor.
    //    Todo lo que pasa DENTRO de una actividad (comentarios, adjuntos,
    //    cambios de estado, transferencias) queda anidado en su propio
    //    mini-expandible — no se desarma en la línea principal, porque son
    //    parte del mismo flujo/autor.
    for (const actividad of actividades) {
      lista.push({
        id: `act-${actividad.id}`,
        fecha: actividad.fecha_creacion,
        modulo: actividad.actor === "EQUIPO_LEGAL" ? "CONTROL_LEGALIDAD" : "PLAN_TRABAJO",
        render: () => <ActividadNode actividad={actividad} />,
      })
    }

    // 4) Informes mensuales de seguimiento.
    for (const informe of informes.data ?? []) {
      lista.push({
        id: `informe-${informe.id}`,
        fecha: informe.fecha_completado ?? informe.fecha_vencimiento,
        modulo: "INFORMES_MENSUALES",
        render: () => <InformeMensualCard medidaId={medidaId} informe={informe} />,
      })
    }

    return lista.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
  }, [historial.data, etapasTimeline, documentosPorEtapa, actividades, informes.data, medidaId])

  return {
    isLoading,
    error,
    medida: trazabilidad.data?.medida,
    resumen: trazabilidad.data?.resumen,
    totalEventosHistorial: historial.data?.count ?? 0,
    totalActividades: actividades.length,
    totalInformes: informes.data?.length ?? 0,
    items,
    // Expuestos para el panel de diagnóstico.
    historialResults: historial.data?.results ?? [],
  }
}
