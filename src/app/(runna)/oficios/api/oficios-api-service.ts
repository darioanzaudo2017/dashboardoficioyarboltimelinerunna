import { get } from "@/app/api/apiService"
import type { MedidaAllItem } from "../../indicadores/types"

/** Busca en backend por identificadores de medida, legajo y oficio. */
export const buscarMedidasConOficios = async (query: string): Promise<MedidaAllItem[]> => {
  return get<MedidaAllItem[]>("medidas-all/", { search: query })
}
