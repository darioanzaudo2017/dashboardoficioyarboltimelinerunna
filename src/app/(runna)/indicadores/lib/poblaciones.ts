/**
 * Subconjuntos de medidas que usan tanto la pantalla de indicadores como la
 * exportación a Excel. Viven acá (y no sueltos en `page.tsx`) para que el
 * reporte exportado no pueda divergir de lo que se ve en pantalla.
 */
import { porNnyaUnico } from "./agrupar"
import type { MedidaEnriquecida } from "./enriquecer"

export interface PoblacionesIndicadores {
  mpi: MedidaEnriquecida[]
  mpe: MedidaEnriquecida[]
  mpj: MedidaEnriquecida[]
  mpeCesadas: MedidaEnriquecida[]
  mpeAbiertas: MedidaEnriquecida[]
  mpjAbiertas: MedidaEnriquecida[]
  mpjCerradas: MedidaEnriquecida[]
  /** Una medida por NNyA (deduplicado) sobre el total del período. */
  nnyaTotales: MedidaEnriquecida[]
}

export function derivarPoblaciones(medidas: MedidaEnriquecida[]): PoblacionesIndicadores {
  const mpi = medidas.filter((m) => m.tipoMedida === "MPI")
  const mpe = medidas.filter((m) => m.tipoMedida === "MPE")
  const mpj = medidas.filter((m) => m.tipoMedida === "MPJ")

  return {
    mpi,
    mpe,
    mpj,
    mpeCesadas: mpe.filter((m) => m.estaCerrada),
    mpeAbiertas: mpe.filter((m) => m.estadoVigencia === "VIGENTE"),
    mpjAbiertas: mpj.filter((m) => m.estadoVigencia === "VIGENTE"),
    mpjCerradas: mpj.filter((m) => m.estaCerrada),
    nnyaTotales: porNnyaUnico(medidas),
  }
}
