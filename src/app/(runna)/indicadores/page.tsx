"use client"

/**
 * Página de Indicadores SPPD (IP1-IP27).
 *
 * Fuente de datos: una única llamada liviana a
 * `GET /medidas-all/?include_actividades=false`. El backend incluye los
 * datos demográficos, motivos de cierre y demandas de origen necesarios.
 *
 * Gaps de datos confirmados (quedan marcados como "No disponible" en la
 * página, no ausentes en silencio):
 * - IP6 / IP9: Dispositivos Especializados de Aprehensión (DEA) no existen
 *   en el sistema — Córdoba no tiene este tipo de dispositivo.
 *
 * Simplificaciones deliberadas (ajustables si hace falta más precisión):
 * - "Grupos etarios" y "grupos de duración": cortes definidos acá mismo
 *   (`lib/edad.ts`), no hay cortes oficiales de la planilla en el código.
 * - "Período": filtra por fecha de apertura de la medida (no hay filtro de
 *   fecha soportado confirmado en `medidas-all`, así que se hace en cliente).
 * - "NNyA con intervenciones" (IP1-IP3) se trata como equivalente a "NNyA
 *   con medida creada en el período" — mismo dataset, no hay una noción de
 *   "intervención" separada de "medida" accesible en bloque.
 */
import { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import BarChartIcon from "@mui/icons-material/BarChart"
import { useIndicadoresData } from "./hooks/useIndicadoresData"
import { contarPor, contarUnicos, porNnyaUnico } from "./lib/agrupar"
import { grupoDuracion, ORDEN_GRUPOS_DURACION, ORDEN_GRUPOS_ETARIOS } from "./lib/edad"
import { ORDEN_GENERO, ORDEN_TIPO_MEDIDA } from "./lib/constantes"
import { calcularSerieVigentes } from "./lib/serie-vigentes"
import { IndicadorCard, IndicadorNoDisponible } from "./components/IndicadorCard"
import { IndicadorParCard } from "./components/IndicadorParCard"
import { DesgloseBarras } from "./components/DesgloseBarras"
import { DesglosePie } from "./components/DesglosePie"
import { LineaVigentes } from "./components/LineaVigentes"

export default function IndicadoresPage() {
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")

  const { isLoading, error, medidas, todas, totalSinFiltro } = useIndicadoresData({
    desde: desde || undefined,
    hasta: hasta || undefined,
  })

  const serieVigentes = useMemo(() => calcularSerieVigentes(todas), [todas])

  const mpi = useMemo(() => medidas.filter((m) => m.tipoMedida === "MPI"), [medidas])
  const mpe = useMemo(() => medidas.filter((m) => m.tipoMedida === "MPE"), [medidas])
  const mpj = useMemo(() => medidas.filter((m) => m.tipoMedida === "MPJ"), [medidas])

  const mpeCesadas = useMemo(() => mpe.filter((m) => m.estaCerrada), [mpe])
  const mpeAbiertas = useMemo(() => mpe.filter((m) => m.estadoVigencia === "VIGENTE"), [mpe])
  const mpjAbiertas = useMemo(() => mpj.filter((m) => m.estadoVigencia === "VIGENTE"), [mpj])
  const mpjCerradas = useMemo(() => mpj.filter((m) => m.estaCerrada), [mpj])

  const nnyaTotales = useMemo(() => porNnyaUnico(medidas), [medidas])

  // Cantidad de NNyA únicos por cada valor de una dimensión, para mostrar
  // como dato secundario junto al conteo de medidas.
  const nnyaPor = (lista: typeof medidas, selector: (m: (typeof medidas)[number]) => string | null | undefined, label: string) => {
    const sub = lista.filter((m) => (selector(m) || "Sin dato") === label)
    return contarUnicos(sub, (m) => m.nnyaId)
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <BarChartIcon color="primary" fontSize="large" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Indicadores SPPD
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        27 indicadores del sistema de monitoreo de intervenciones (IP1-IP27). Los indicadores DEA
        se marcan como no aplicables porque Córdoba no cuenta con ese tipo de dispositivo.
      </Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Período (fecha de apertura de la medida):
          </Typography>
          <TextField
            type="date"
            size="small"
            label="Desde"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            size="small"
            label="Hasta"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Typography variant="caption" color="text.secondary">
            {medidas.length} de {totalSinFiltro} medidas en el período seleccionado
          </Typography>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar los datos: {(error as Error).message}
        </Alert>
      )}

      {isLoading && (
        <Stack spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={140} />
          ))}
        </Stack>
      )}

      {!isLoading && !error && (
        <>
          {/* Complementario (no es un IP numerado): evolución de medidas vigentes */}
          <IndicadorCard
            codigo="Evolución"
            titulo="Medidas vigentes por mes, según tipo (histórico completo, no depende del filtro de período)"
          >
            <LineaVigentes data={serieVigentes} />
          </IndicadorCard>

          {/* IP1 / IP1.3 */}
          <IndicadorCard
            codigo="IP1 / IP1.3"
            titulo="NNyA con intervenciones en el período"
            total={nnyaTotales.length}
            totalLabel="NNyA"
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DesglosePie
                  titulo="Por género"
                  data={contarPor(nnyaTotales, (m) => m.genero, ORDEN_GENERO)}
                  ordenColor={ORDEN_GENERO}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DesgloseBarras
                  titulo="Por grupo etario"
                  data={contarPor(nnyaTotales, (m) => m.grupoEtario, ORDEN_GRUPOS_ETARIOS)}
                  ordenColor={ORDEN_GRUPOS_ETARIOS}
                />
              </Grid>
            </Grid>
          </IndicadorCard>

          {/* IP2 */}
          <IndicadorCard codigo="IP2" titulo="NNyA con intervenciones según caracterización" total={nnyaTotales.length} totalLabel="NNyA">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DesglosePie
                  titulo="Disponibilidad de DNI"
                  data={contarPor(nnyaTotales, (m) =>
                    m.tieneDni === null ? "Sin dato" : m.tieneDni ? "Con DNI" : "Sin DNI"
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DesgloseBarras titulo="Por nacionalidad" data={contarPor(nnyaTotales, (m) => m.nacionalidad)} />
              </Grid>
            </Grid>
            <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
              Nivel educativo no disponible en este corte: requiere una consulta individual por NNyA
              (endpoint de educación de persona), no viene en el listado masivo.
            </Alert>
          </IndicadorCard>

          {/* IP3 / IP4 / IP7 */}
          <IndicadorCard
            codigo="IP3 / IP4 / IP7"
            titulo="Medidas y NNyA creadas según tipo de medida"
            total={medidas.length}
            totalLabel={`medidas · ${nnyaTotales.length} NNyA`}
          >
            <DesglosePie
              titulo="Por tipo de medida (MPI / MPE / MPJ)"
              data={contarPor(medidas, (m) => m.tipoMedida, ORDEN_TIPO_MEDIDA)}
              ordenColor={ORDEN_TIPO_MEDIDA}
              secundario={(label) => nnyaPor(medidas, (m) => m.tipoMedida, label)}
              secundarioLabel="NNyA"
            />
            <DesgloseBarras titulo="Por mes de creación (medidas)" data={contarPor(medidas, (m) => m.mesApertura)} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DesglosePie
                  titulo="Por género (NNyA)"
                  data={contarPor(nnyaTotales, (m) => m.genero, ORDEN_GENERO)}
                  ordenColor={ORDEN_GENERO}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DesgloseBarras
                  titulo="Por grupo etario (NNyA)"
                  data={contarPor(nnyaTotales, (m) => m.grupoEtario, ORDEN_GRUPOS_ETARIOS)}
                  ordenColor={ORDEN_GRUPOS_ETARIOS}
                />
              </Grid>
            </Grid>
          </IndicadorCard>

          {/* IP5 / IP8 */}
          <IndicadorCard
            codigo="IP5 / IP8"
            titulo="MPJ creadas según tipo de dispositivo"
            total={mpj.length}
            totalLabel={`MPJ · ${porNnyaUnico(mpj).length} NNyA`}
          >
            <DesgloseBarras
              titulo="Por tipo de dispositivo"
              data={contarPor(mpj, (m) => m.tipoDispositivo)}
              secundario={(label) => nnyaPor(mpj, (m) => m.tipoDispositivo, label)}
              secundarioLabel="NNyA"
            />
            <DesgloseBarras titulo="Por mes de creación" data={contarPor(mpj, (m) => m.mesApertura)} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DesglosePie
                  titulo="Por género (NNyA)"
                  data={contarPor(porNnyaUnico(mpj), (m) => m.genero, ORDEN_GENERO)}
                  ordenColor={ORDEN_GENERO}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DesgloseBarras
                  titulo="Por grupo etario (NNyA)"
                  data={contarPor(porNnyaUnico(mpj), (m) => m.grupoEtario, ORDEN_GRUPOS_ETARIOS)}
                  ordenColor={ORDEN_GRUPOS_ETARIOS}
                />
              </Grid>
            </Grid>
          </IndicadorCard>

          {/* IP6 / IP9 */}
          <IndicadorNoDisponible
            codigo="IP6 / IP9"
            titulo="Ingresos a Dispositivos Especializados de Aprehensión (DEA)"
            motivo="Córdoba no cuenta con este tipo de dispositivo — confirmado: no hay ninguna referencia a 'DEA' en todo el sistema."
          />

          {/* IP10 / IP11 */}
          <IndicadorParCard
            codigo="IP10 / IP11"
            titulo="MPI creadas según motivo de intervención"
            lista={mpi}
            dimensionTitulo="Por motivo de intervención"
            dimensionSelector={(m) => m.motivoIntervencion}
          />

          {/* IP12 / IP13 */}
          <IndicadorParCard
            codigo="IP12 / IP13"
            titulo="MPE creadas según motivo de intervención"
            lista={mpe}
            dimensionTitulo="Por motivo de intervención"
            dimensionSelector={(m) => m.motivoIntervencion}
          />

          {/* IP14 / IP15 */}
          <IndicadorParCard
            codigo="IP14 / IP15"
            titulo="MPE creadas según tipo de alojamiento"
            lista={mpe}
            dimensionTitulo="Por tipo de alojamiento"
            dimensionSelector={(m) => m.tipoDispositivo}
          />

          {/* IP16 / IP17 */}
          <IndicadorParCard
            codigo="IP16 / IP17"
            titulo="MPE cesadas según duración de la medida"
            lista={mpeCesadas}
            dimensionTitulo="Por duración"
            dimensionSelector={(m) => grupoDuracion(m.duracionDias)}
            dimensionOrden={ORDEN_GRUPOS_DURACION}
          />

          {/* IP18 / IP19 */}
          <IndicadorParCard
            codigo="IP18 / IP19"
            titulo="MPE cesadas según motivo de cierre"
            lista={mpeCesadas}
            dimensionTitulo="Por motivo de cierre"
            dimensionSelector={(m) => m.motivoCese}
          />

          {/* IP20 / IP21 */}
          <IndicadorParCard
            codigo="IP20 / IP21"
            titulo="MPI creadas según origen de la demanda"
            lista={mpi}
            dimensionTitulo="Por origen de la demanda"
            dimensionSelector={(m) => m.origenDemanda}
          />

          {/* IP22 / IP23 */}
          <IndicadorParCard
            codigo="IP22 / IP23"
            titulo="MPE creadas según origen de la demanda"
            lista={mpe}
            dimensionTitulo="Por origen de la demanda"
            dimensionSelector={(m) => m.origenDemanda}
          />

          {/* IP24 */}
          <IndicadorParCard
            codigo="IP24"
            titulo="MPE abiertas (sin cierre) a la fecha según duración"
            lista={mpeAbiertas}
            dimensionTitulo="Por duración (a hoy)"
            dimensionSelector={(m) => grupoDuracion(m.duracionDias)}
            dimensionOrden={ORDEN_GRUPOS_DURACION}
            incluirGeneroYEdad={false}
          />

          {/* IP25 */}
          <IndicadorCard
            codigo="IP25"
            titulo="MPJ abiertas (sin cierre) a la fecha según tipo de dispositivo y duración"
            total={mpjAbiertas.length}
            totalLabel="MPJ abiertas"
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DesgloseBarras titulo="Por tipo de dispositivo" data={contarPor(mpjAbiertas, (m) => m.tipoDispositivo)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DesgloseBarras
                  titulo="Por duración (a hoy)"
                  data={contarPor(mpjAbiertas, (m) => grupoDuracion(m.duracionDias), ORDEN_GRUPOS_DURACION)}
                  ordenColor={ORDEN_GRUPOS_DURACION}
                />
              </Grid>
            </Grid>
          </IndicadorCard>

          {/* IP26 / IP27 */}
          <IndicadorCard
            codigo="IP26 / IP27"
            titulo="MPJ cerradas en el período según tipo de dispositivo y duración"
            total={mpjCerradas.length}
            totalLabel={`MPJ · ${porNnyaUnico(mpjCerradas).length} NNyA`}
          >
            <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
              La porción de DEA de este indicador no aplica — Córdoba no tiene ese dispositivo.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DesgloseBarras
                  titulo="Por tipo de dispositivo"
                  data={contarPor(mpjCerradas, (m) => m.tipoDispositivo)}
                  secundario={(label) => nnyaPor(mpjCerradas, (m) => m.tipoDispositivo, label)}
                  secundarioLabel="NNyA"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DesgloseBarras
                  titulo="Por duración"
                  data={contarPor(mpjCerradas, (m) => grupoDuracion(m.duracionDias), ORDEN_GRUPOS_DURACION)}
                  ordenColor={ORDEN_GRUPOS_DURACION}
                  secundario={(label) =>
                    nnyaPor(mpjCerradas, (m) => grupoDuracion(m.duracionDias), label)
                  }
                  secundarioLabel="NNyA"
                />
              </Grid>
            </Grid>
          </IndicadorCard>
        </>
      )}
    </Box>
  )
}
