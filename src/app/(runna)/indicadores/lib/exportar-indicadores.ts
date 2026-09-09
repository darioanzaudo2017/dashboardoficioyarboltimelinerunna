/**
 * Exportación a Excel de los Indicadores SPPD (IP1-IP27).
 *
 * Mismo enfoque que el resto del sistema (ver
 * `mesadeentrada/ui/dataGrid/exportDemandas.ts`): `xlsx` (SheetJS) del lado
 * del cliente sobre los datos que ya están en memoria, y aviso con `toast`.
 * No agrega ninguna llamada al backend.
 *
 * Genera tres hojas:
 * - "Indicadores": los IP1-IP27 en formato largo (una fila por categoría de
 *   cada desglose), respetando el período filtrado en pantalla. El formato
 *   largo es a propósito: es el que Excel necesita para armar tablas
 *   dinámicas sin tener que reacomodar nada a mano.
 * - "Evolución mensual": la serie del gráfico "Medidas vigentes por mes,
 *   según tipo". Igual que en pantalla, es histórica completa y NO depende
 *   del filtro de período.
 * - "Datos": una fila por medida del período filtrado, que es la fuente con
 *   la que se calcula todo lo anterior. No incluye nombre ni número de DNI
 *   del NNyA (la pantalla tampoco los usa): sólo el ID interno y las
 *   dimensiones que alimentan los indicadores.
 */
import * as XLSX from "xlsx"
import { toast } from "react-toastify"
import { getCurrentDateISO } from "@/utils/dateUtils"
import { contarPor, contarUnicos, porNnyaUnico } from "./agrupar"
import type { ItemDesglose } from "./agrupar"
import { grupoDuracion, ORDEN_GRUPOS_DURACION, ORDEN_GRUPOS_ETARIOS } from "./edad"
import { etiquetaDisponibilidadDni, ORDEN_GENERO, ORDEN_TIPO_MEDIDA } from "./constantes"
import { derivarPoblaciones } from "./poblaciones"
import type { MedidaEnriquecida } from "./enriquecer"
import type { PuntoSerieVigentes } from "./serie-vigentes"

/**
 * Valor de los indicadores que no aplican en Córdoba (DEA: no existe ese tipo
 * de dispositivo). Se exporta como texto legible en vez de dejar la celda
 * vacía o con `null`, para que quien lee el reporte sepa que es "no aplica" y
 * no "cero" ni "faltó el dato".
 */
const NO_APLICA = "N/A"
const SIN_DATO = "Sin dato"

type UnidadIndicador = "medidas" | "NNyA"

type SelectorDimension = (m: MedidaEnriquecida) => string | null | undefined

interface FilaIndicador {
  Código: string
  Indicador: string
  Desglose: string
  Categoría: string
  Unidad: UnidadIndicador
  Valor: number | string
  Observación: string
}

export interface ParametrosExportacionIndicadores {
  /** Medidas ya filtradas por el período elegido en pantalla. */
  medidas: MedidaEnriquecida[]
  /** Serie histórica completa de medidas vigentes por mes (no depende del período). */
  serieVigentes: PuntoSerieVigentes[]
  /** Extremos del filtro de período (YYYY-MM-DD), para el nombre del archivo. */
  desde?: string
  hasta?: string
}

/** Texto para la hoja "Datos": nunca deja la celda vacía ni con `null`. */
const texto = (valor: string | null | undefined): string =>
  valor && valor.trim() !== "" ? valor : SIN_DATO

/** Las fechas del backend traen hora; para el reporte alcanza la parte de calendario. */
const soloFecha = (iso: string | null | undefined): string => (iso ? iso.slice(0, 10) : SIN_DATO)

/**
 * Arma la hoja "Indicadores" replicando, tarjeta por tarjeta, lo que muestra
 * `page.tsx`. Cada desglose emite una fila por categoría; los desgloses que en
 * pantalla muestran "N medidas (M NNyA)" emiten dos filas por categoría, una
 * por unidad.
 */
const construirFilasIndicadores = (medidas: MedidaEnriquecida[]): FilaIndicador[] => {
  const { mpi, mpe, mpj, mpeCesadas, mpeAbiertas, mpjAbiertas, mpjCerradas, nnyaTotales } =
    derivarPoblaciones(medidas)

  const filas: FilaIndicador[] = []

  const agregar = (
    codigo: string,
    indicador: string,
    desglose: string,
    categoria: string,
    unidad: UnidadIndicador,
    valor: number | string,
    observacion = ""
  ) => {
    filas.push({
      Código: codigo,
      Indicador: indicador,
      Desglose: desglose,
      Categoría: categoria,
      Unidad: unidad,
      Valor: valor,
      Observación: observacion,
    })
  }

  /** Fila(s) de encabezado de cada indicador: el número grande de la tarjeta. */
  const agregarTotales = (
    codigo: string,
    indicador: string,
    opciones: { medidas?: number | string; nnya?: number | string; observacion?: string }
  ) => {
    const desde = filas.length
    if (opciones.medidas !== undefined) agregar(codigo, indicador, "Total", "Total", "medidas", opciones.medidas)
    if (opciones.nnya !== undefined) agregar(codigo, indicador, "Total", "Total", "NNyA", opciones.nnya)
    if (opciones.observacion && filas.length > desde) filas[desde].Observación = opciones.observacion
  }

  const agregarDesglose = (
    codigo: string,
    indicador: string,
    desglose: string,
    data: ItemDesglose[],
    unidad: UnidadIndicador
  ) => {
    for (const item of data) agregar(codigo, indicador, desglose, item.label, unidad, item.value)
  }

  /** Desglose que en pantalla muestra medidas y NNyA lado a lado. */
  const agregarDesglosePar = (
    codigo: string,
    indicador: string,
    desglose: string,
    lista: MedidaEnriquecida[],
    selector: SelectorDimension,
    orden?: string[]
  ) => {
    for (const item of contarPor(lista, selector, orden)) {
      agregar(codigo, indicador, desglose, item.label, "medidas", item.value)
      const sub = lista.filter((m) => (selector(m) || SIN_DATO) === item.label)
      agregar(codigo, indicador, desglose, item.label, "NNyA", contarUnicos(sub, (m) => m.nnyaId))
    }
  }

  /** Equivalente exacto de `IndicadorParCard`: total + dimensión + género y edad de esos NNyA. */
  const agregarParCard = (
    codigo: string,
    indicador: string,
    lista: MedidaEnriquecida[],
    dimensionTitulo: string,
    selector: SelectorDimension,
    opciones: { orden?: string[]; incluirGeneroYEdad?: boolean } = {}
  ) => {
    const nnyaUnicos = porNnyaUnico(lista)
    agregarTotales(codigo, indicador, { medidas: lista.length, nnya: nnyaUnicos.length })
    agregarDesglosePar(codigo, indicador, dimensionTitulo, lista, selector, opciones.orden)
    if (opciones.incluirGeneroYEdad !== false) {
      agregarDesglose(
        codigo,
        indicador,
        "Por género (NNyA)",
        contarPor(nnyaUnicos, (m) => m.genero, ORDEN_GENERO),
        "NNyA"
      )
      agregarDesglose(
        codigo,
        indicador,
        "Por grupo etario (NNyA)",
        contarPor(nnyaUnicos, (m) => m.grupoEtario, ORDEN_GRUPOS_ETARIOS),
        "NNyA"
      )
    }
  }

  // IP1 / IP1.3
  const ip1 = "NNyA con medidas registradas en el período"
  agregarTotales("IP1 / IP1.3", ip1, { nnya: nnyaTotales.length })
  agregarDesglose("IP1 / IP1.3", ip1, "Por género", contarPor(nnyaTotales, (m) => m.genero, ORDEN_GENERO), "NNyA")
  agregarDesglose(
    "IP1 / IP1.3",
    ip1,
    "Por grupo etario",
    contarPor(nnyaTotales, (m) => m.grupoEtario, ORDEN_GRUPOS_ETARIOS),
    "NNyA"
  )

  // IP2
  const ip2 = "NNyA con medidas según caracterización"
  agregarTotales("IP2", ip2, {
    nnya: nnyaTotales.length,
    observacion:
      "Nivel educativo no disponible en este corte: requiere una consulta individual por NNyA, no viene en el listado masivo.",
  })
  agregarDesglose(
    "IP2",
    ip2,
    "Disponibilidad de DNI",
    contarPor(nnyaTotales, (m) => etiquetaDisponibilidadDni(m.tieneDni)),
    "NNyA"
  )
  agregarDesglose("IP2", ip2, "Por nacionalidad", contarPor(nnyaTotales, (m) => m.nacionalidad), "NNyA")

  // IP3 / IP4 / IP7
  const ip3 = "Medidas y NNyA creadas según tipo de medida"
  agregarTotales("IP3 / IP4 / IP7", ip3, { medidas: medidas.length, nnya: nnyaTotales.length })
  agregarDesglosePar("IP3 / IP4 / IP7", ip3, "Por tipo de medida", medidas, (m) => m.tipoMedida, ORDEN_TIPO_MEDIDA)
  agregarDesglose(
    "IP3 / IP4 / IP7",
    ip3,
    "Por mes de creación",
    contarPor(medidas, (m) => m.mesApertura),
    "medidas"
  )
  agregarDesglose(
    "IP3 / IP4 / IP7",
    ip3,
    "Por género (NNyA)",
    contarPor(nnyaTotales, (m) => m.genero, ORDEN_GENERO),
    "NNyA"
  )
  agregarDesglose(
    "IP3 / IP4 / IP7",
    ip3,
    "Por grupo etario (NNyA)",
    contarPor(nnyaTotales, (m) => m.grupoEtario, ORDEN_GRUPOS_ETARIOS),
    "NNyA"
  )

  // IP5 / IP8
  const ip5 = "MPJ creadas según tipo de dispositivo"
  const nnyaMpj = porNnyaUnico(mpj)
  agregarTotales("IP5 / IP8", ip5, { medidas: mpj.length, nnya: nnyaMpj.length })
  agregarDesglosePar("IP5 / IP8", ip5, "Por tipo de dispositivo", mpj, (m) => m.tipoDispositivo)
  agregarDesglose("IP5 / IP8", ip5, "Por mes de creación", contarPor(mpj, (m) => m.mesApertura), "medidas")
  agregarDesglose("IP5 / IP8", ip5, "Por género (NNyA)", contarPor(nnyaMpj, (m) => m.genero, ORDEN_GENERO), "NNyA")
  agregarDesglose(
    "IP5 / IP8",
    ip5,
    "Por grupo etario (NNyA)",
    contarPor(nnyaMpj, (m) => m.grupoEtario, ORDEN_GRUPOS_ETARIOS),
    "NNyA"
  )

  // IP6 / IP9 — no aplica en Córdoba, se exporta como "N/A" y no como celda vacía.
  agregarTotales("IP6 / IP9", "Ingresos a Dispositivos Especializados de Aprehensión (DEA)", {
    medidas: NO_APLICA,
    nnya: NO_APLICA,
    observacion: "No aplica: Córdoba no cuenta con este tipo de dispositivo.",
  })

  // IP10 / IP11
  agregarParCard(
    "IP10 / IP11",
    "MPI creadas según motivo de intervención",
    mpi,
    "Por motivo de intervención",
    (m) => m.motivoIntervencion
  )

  // IP12 / IP13
  agregarParCard(
    "IP12 / IP13",
    "MPE creadas según motivo de intervención",
    mpe,
    "Por motivo de intervención",
    (m) => m.motivoIntervencion
  )

  // IP14 / IP15
  agregarParCard(
    "IP14 / IP15",
    "MPE creadas según tipo de alojamiento",
    mpe,
    "Por tipo de alojamiento",
    (m) => m.tipoDispositivo
  )

  // IP16 / IP17
  agregarParCard(
    "IP16 / IP17",
    "MPE cesadas según duración de la medida",
    mpeCesadas,
    "Por duración",
    (m) => grupoDuracion(m.duracionDias),
    { orden: ORDEN_GRUPOS_DURACION }
  )

  // IP18 / IP19
  agregarParCard(
    "IP18 / IP19",
    "MPE cesadas según motivo de cierre",
    mpeCesadas,
    "Por motivo de cierre",
    (m) => m.motivoCese
  )

  // IP20 / IP21
  agregarParCard(
    "IP20 / IP21",
    "MPI creadas según origen de la demanda",
    mpi,
    "Por origen de la demanda",
    (m) => m.origenDemanda
  )

  // IP22 / IP23
  agregarParCard(
    "IP22 / IP23",
    "MPE creadas según origen de la demanda",
    mpe,
    "Por origen de la demanda",
    (m) => m.origenDemanda
  )

  // IP24
  agregarParCard(
    "IP24",
    "MPE abiertas (sin cierre) a la fecha según duración",
    mpeAbiertas,
    "Por duración (a hoy)",
    (m) => grupoDuracion(m.duracionDias),
    { orden: ORDEN_GRUPOS_DURACION, incluirGeneroYEdad: false }
  )

  // IP25
  const ip25 = "MPJ abiertas (sin cierre) a la fecha según tipo de dispositivo y duración"
  agregarTotales("IP25", ip25, { medidas: mpjAbiertas.length })
  agregarDesglose(
    "IP25",
    ip25,
    "Por tipo de dispositivo",
    contarPor(mpjAbiertas, (m) => m.tipoDispositivo),
    "medidas"
  )
  agregarDesglose(
    "IP25",
    ip25,
    "Por duración (a hoy)",
    contarPor(mpjAbiertas, (m) => grupoDuracion(m.duracionDias), ORDEN_GRUPOS_DURACION),
    "medidas"
  )

  // IP26 / IP27
  const ip26 = "MPJ cerradas en el período según tipo de dispositivo y duración"
  agregarTotales("IP26 / IP27", ip26, {
    medidas: mpjCerradas.length,
    nnya: porNnyaUnico(mpjCerradas).length,
    observacion: `La porción de DEA de este indicador no aplica (${NO_APLICA}): Córdoba no tiene ese dispositivo.`,
  })
  agregarDesglosePar("IP26 / IP27", ip26, "Por tipo de dispositivo", mpjCerradas, (m) => m.tipoDispositivo)
  agregarDesglosePar(
    "IP26 / IP27",
    ip26,
    "Por duración",
    mpjCerradas,
    (m) => grupoDuracion(m.duracionDias),
    ORDEN_GRUPOS_DURACION
  )

  return filas
}

/** Hoja "Datos": la fuente cruda con la que se calculan los indicadores. */
const construirFilasDatos = (medidas: MedidaEnriquecida[]) =>
  medidas.map((m) => ({
    "ID medida": m.id,
    "Número de medida": texto(m.numeroMedida),
    "Tipo de medida": m.tipoMedida,
    Estado: texto(m.estadoVigencia),
    "Fecha de apertura": soloFecha(m.fechaApertura),
    "Mes de apertura": texto(m.mesApertura),
    "Fecha de cierre": soloFecha(m.fechaCierre),
    "Duración (días)": m.duracionDias,
    Legajo: texto(m.numeroLegajo),
    Zona: texto(m.zona),
    "ID NNyA": m.nnyaId ?? SIN_DATO,
    Género: texto(m.genero),
    "Edad al abrir la medida": m.edad ?? SIN_DATO,
    "Grupo etario": texto(m.grupoEtario),
    Nacionalidad: texto(m.nacionalidad),
    "Situación DNI": texto(m.situacionDni),
    "Disponibilidad de DNI": etiquetaDisponibilidadDni(m.tieneDni),
    "Motivo de intervención": texto(m.motivoIntervencion),
    "Categoría de intervención": texto(m.categoriaIntervencion),
    "Tipo de dispositivo / alojamiento": texto(m.tipoDispositivo),
    "Subtipo de dispositivo": texto(m.subtipoDispositivo),
    "Motivo de cierre": texto(m.motivoCese),
    "Grupo de duración": grupoDuracion(m.duracionDias),
    "Origen de la demanda": texto(m.origenDemanda),
    Juzgado: texto(m.juzgado?.nombre),
    Urgencia: texto(m.urgencia?.nombre),
  }))

/** Hoja "Evolución mensual": la serie del gráfico de medidas vigentes por mes. */
const construirFilasEvolucion = (serie: PuntoSerieVigentes[]) =>
  serie.map((punto) => ({
    Mes: punto.mes,
    MPI: punto.MPI,
    MPE: punto.MPE,
    MPJ: punto.MPJ,
    Total: punto.MPI + punto.MPE + punto.MPJ,
  }))

/**
 * Sufijo del nombre del archivo: el período filtrado si hay filtro, y si no
 * la fecha de exportación (mismo criterio que `exportDemandas.ts`).
 */
const sufijoArchivo = (desde?: string, hasta?: string): string => {
  if (desde && hasta) return `${desde}_a_${hasta}`
  if (desde) return `desde_${desde}`
  if (hasta) return `hasta_${hasta}`
  return getCurrentDateISO()
}

const anchos = (medidas: number[]) => medidas.map((wch) => ({ wch }))

export const exportarIndicadoresToXlsx = ({
  medidas,
  serieVigentes,
  desde,
  hasta,
}: ParametrosExportacionIndicadores) => {
  if (medidas.length === 0) {
    toast.info("No hay medidas en el período seleccionado para exportar", {
      position: "top-center",
      autoClose: 3000,
    })
    return
  }

  const workbook = XLSX.utils.book_new()

  const hojaIndicadores = XLSX.utils.json_to_sheet(construirFilasIndicadores(medidas))
  hojaIndicadores["!cols"] = anchos([14, 46, 28, 26, 10, 10, 70])
  XLSX.utils.book_append_sheet(workbook, hojaIndicadores, "Indicadores")

  const hojaEvolucion = XLSX.utils.json_to_sheet(construirFilasEvolucion(serieVigentes))
  hojaEvolucion["!cols"] = anchos([12, 10, 10, 10, 10])
  XLSX.utils.book_append_sheet(workbook, hojaEvolucion, "Evolución mensual")

  const hojaDatos = XLSX.utils.json_to_sheet(construirFilasDatos(medidas))
  hojaDatos["!cols"] = anchos([
    12, 20, 16, 16, 18, 16, 18, 16, 16, 22, 12, 16, 22, 18, 18, 18, 22, 32, 28, 32, 28, 28, 20, 26, 26, 18,
  ])
  XLSX.utils.book_append_sheet(workbook, hojaDatos, "Datos")

  XLSX.writeFile(workbook, `Indicadores_SPPD_${sufijoArchivo(desde, hasta)}.xlsx`)

  toast.success("Archivo Excel generado correctamente", {
    position: "top-center",
    autoClose: 3000,
  })
}
