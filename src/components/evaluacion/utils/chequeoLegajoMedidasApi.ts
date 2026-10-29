import axiosInstance from "@/app/api/utils/axiosInstance"
import {
  describirHallazgos,
  personasConMismoDni,
  type MedidaVigente,
  type MedidasPorLegajo,
  type PersonaAEvaluar,
  type PersonaEncontrada,
} from "./chequeoLegajoMedidas"

/**
 * Consulta (solo lectura) legajo y medidas vigentes de cada NNyA por su DNI.
 * - POST demanda-busqueda-vinculacion/ → personas con ese DNI, con su legajo
 * - GET medidas/?legajo=<id>&estado_vigencia=VIGENTE → medidas vigentes de cada legajo encontrado
 */
export const chequearLegajoYMedidas = async (personas: PersonaAEvaluar[]): Promise<string[]> => {
  const lineas: string[] = []

  for (const persona of personas) {
    if (!persona.dni) {
      lineas.push(...describirHallazgos(persona, [], {}))
      continue
    }

    const { data } = await axiosInstance.post("demanda-busqueda-vinculacion/", { dni: String(persona.dni) })
    const encontradas: PersonaEncontrada[] = data?.personas_encontradas ?? []

    const legajoIds = Array.from(
      new Set(
        personasConMismoDni(persona, encontradas)
          .map((p) => p.legajo?.id)
          .filter((id): id is number => typeof id === "number"),
      ),
    )

    const medidasPorLegajo: MedidasPorLegajo = {}
    await Promise.all(
      legajoIds.map(async (legajoId) => {
        const { data: medidas } = await axiosInstance.get("medidas/", { params: { legajo: legajoId, estado_vigencia: "VIGENTE" } })
        medidasPorLegajo[legajoId] = (Array.isArray(medidas) ? medidas : (medidas?.results ?? [])) as MedidaVigente[]
      }),
    )

    lineas.push(...describirHallazgos(persona, encontradas, medidasPorLegajo))
  }

  return lineas
}
