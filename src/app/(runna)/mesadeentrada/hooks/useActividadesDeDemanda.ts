import { useQuery } from "@tanstack/react-query"
import { buscarActividadesDeDemanda } from "../services/actividadesDeDemandaService"

/** Actividades que generó una demanda de oficio (para verlas y asignarlas desde la Mesa de Entradas). */
export const useActividadesDeDemanda = (demandaId: number | null | undefined, enabled = true) =>
  useQuery({
    queryKey: ["actividades-demanda", demandaId],
    queryFn: () => buscarActividadesDeDemanda(demandaId as number),
    enabled: enabled && !!demandaId,
    staleTime: 60 * 1000,
  })
