import type { MedidaEnriquecida } from "../../indicadores/lib/enriquecer"

export const SIN_DISPOSITIVO = "Sin dispositivo configurado"
export const SIN_INSTITUCION = "Sin institución / familia"

export interface MedidaDeDispositivo {
  id: number
  numeroMedida: string
  numeroLegajo: string | null
  tipoMedida: MedidaEnriquecida["tipoMedida"]
}

export interface InstitucionConNinos {
  nombre: string
  /** Niños distintos (un niño con dos medidas en la misma institución cuenta una vez). */
  ninos: number
  medidas: MedidaDeDispositivo[]
}

export interface DispositivoConNinos {
  tipo: string
  /** Niños distintos del tipo de dispositivo. */
  ninos: number
  instituciones: InstitucionConNinos[]
}

export interface FiltroDispositivos {
  tipoMedida?: MedidaEnriquecida["tipoMedida"] | "TODAS"
  zona?: string
  texto?: string
}

type MedidaParaContar = Pick<
  MedidaEnriquecida,
  "id" | "numeroMedida" | "numeroLegajo" | "tipoMedida" | "estadoVigencia" | "estaCerrada" | "nnyaId" | "zona" | "tipoDispositivo" | "subtipoDispositivo"
>

const idDeNino = (m: MedidaParaContar): string => (m.nnyaId != null ? `n${m.nnyaId}` : `l${m.numeroLegajo ?? m.id}`)

const coincide = (valor: string | null, texto: string): boolean => (valor ?? "").toLowerCase().includes(texto)

/**
 * Cuenta los niños que hoy están en cada dispositivo (tipo → institución o familia), según el dispositivo que se
 * configura en la medida vigente. Solo entran medidas vigentes; cada niño se cuenta una vez por nivel.
 */
export interface ResumenDispositivos {
  dispositivos: DispositivoConNinos[]
  /** Niños distintos en total (un niño con dos medidas vigentes cuenta una vez). */
  totalNinos: number
  totalMedidas: number
}

export function contarNinosPorDispositivo(medidas: MedidaParaContar[], filtro: FiltroDispositivos = {}): ResumenDispositivos {
  const texto = (filtro.texto ?? "").trim().toLowerCase()

  const vigentes = medidas.filter((m) => {
    if (m.estaCerrada || m.estadoVigencia !== "VIGENTE") return false
    if (filtro.tipoMedida && filtro.tipoMedida !== "TODAS" && m.tipoMedida !== filtro.tipoMedida) return false
    if (filtro.zona && m.zona !== filtro.zona) return false
    if (texto && !coincide(m.tipoDispositivo ?? SIN_DISPOSITIVO, texto) && !coincide(m.subtipoDispositivo ?? SIN_INSTITUCION, texto)) {
      return false
    }
    return true
  })

  const porTipo = new Map<string, Map<string, MedidaParaContar[]>>()
  for (const m of vigentes) {
    const tipo = m.tipoDispositivo?.trim() || SIN_DISPOSITIVO
    const institucion = m.subtipoDispositivo?.trim() || SIN_INSTITUCION
    const instituciones = porTipo.get(tipo) ?? new Map<string, MedidaParaContar[]>()
    instituciones.set(institucion, [...(instituciones.get(institucion) ?? []), m])
    porTipo.set(tipo, instituciones)
  }

  const resultado = Array.from(porTipo.entries()).map(([tipo, instituciones]): DispositivoConNinos => {
    const filas = Array.from(instituciones.entries()).map(([nombre, lista]): InstitucionConNinos => ({
      nombre,
      ninos: new Set(lista.map(idDeNino)).size,
      medidas: lista.map(({ id, numeroMedida, numeroLegajo, tipoMedida }) => ({ id, numeroMedida, numeroLegajo, tipoMedida })),
    }))
    filas.sort((a, b) => b.ninos - a.ninos || a.nombre.localeCompare(b.nombre, "es"))
    const todos = Array.from(instituciones.values()).flat()
    return { tipo, ninos: new Set(todos.map(idDeNino)).size, instituciones: filas }
  })

  // "Sin dispositivo configurado" al final: es lo que falta cargar, no un dispositivo.
  resultado.sort((a, b) => {
    if (a.tipo === SIN_DISPOSITIVO) return 1
    if (b.tipo === SIN_DISPOSITIVO) return -1
    return b.ninos - a.ninos || a.tipo.localeCompare(b.tipo, "es")
  })

  return { dispositivos: resultado, totalNinos: new Set(vigentes.map(idDeNino)).size, totalMedidas: vigentes.length }
}
