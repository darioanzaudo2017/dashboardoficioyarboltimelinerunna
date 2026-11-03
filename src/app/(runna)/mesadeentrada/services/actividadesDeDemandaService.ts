import { globalActividadService } from "@/app/(runna)/legajo/actividades/services/globalActividadService"
import { extractArray } from "@/hooks/useApiQuery"
import type { TActividadPlanTrabajo } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/types/actividades"
import { filtrarActividadesDeDemanda } from "../utils/actividadesDeOficio"

const TAMANO_PAGINA = 100 // el servidor no devuelve más de 100 por página
const MAX_PAGINAS = 10

/**
 * Trae las actividades que generó una demanda de oficio. El servidor no filtra por demanda, así que se recorren las
 * actividades de origen oficio (las más nuevas primero) y se queda con las de esa demanda.
 */
export const buscarActividadesDeDemanda = async (demandaId: number): Promise<TActividadPlanTrabajo[]> => {
  const encontradas: TActividadPlanTrabajo[] = []

  for (let page = 1; page <= MAX_PAGINAS; page++) {
    const respuesta = await globalActividadService.list({
      origen: "DEMANDA_OFICIO",
      ordering: "-fecha_creacion",
      page,
      page_size: TAMANO_PAGINA,
    })
    const pagina = extractArray<TActividadPlanTrabajo>(respuesta as any)
    encontradas.push(...filtrarActividadesDeDemanda(pagina, demandaId))

    const hayMas = !Array.isArray(respuesta) && !!(respuesta as { next?: string }).next
    if (!hayMas) break
  }

  return encontradas
}
