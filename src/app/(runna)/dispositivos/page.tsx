"use client"

/**
 * Niños por dispositivo.
 *
 * Cuenta los niños que hoy están en cada dispositivo (tipo de dispositivo → institución o familia), tomando el
 * dispositivo que se configura en la medida vigente. Usa la misma llamada liviana que Indicadores
 * (`GET /medidas-all/?include_actividades=false`), sin pedir medida por medida.
 */
import { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Chip,
  Collapse,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import HomeWorkIcon from "@mui/icons-material/HomeWork"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import { useIndicadoresData } from "../indicadores/hooks/useIndicadoresData"
import {
  contarNinosPorDispositivo,
  SIN_DISPOSITIVO,
  type DispositivoConNinos,
  type FiltroDispositivos,
} from "./lib/contar-por-dispositivo"

const TIPOS_MEDIDA: Array<{ valor: NonNullable<FiltroDispositivos["tipoMedida"]>; etiqueta: string }> = [
  { valor: "TODAS", etiqueta: "Todas las medidas" },
  { valor: "MPE", etiqueta: "MPE" },
  { valor: "MPI", etiqueta: "MPI" },
  { valor: "MPJ", etiqueta: "MPJ" },
]

function FilaDispositivo({ dispositivo }: { dispositivo: DispositivoConNinos }) {
  const [abierto, setAbierto] = useState(false)
  const sinConfigurar = dispositivo.tipo === SIN_DISPOSITIVO

  return (
    <>
      <TableRow hover sx={{ "& > td": { borderBottom: abierto ? "none" : undefined } }}>
        <TableCell width={48}>
          <IconButton
            size="small"
            aria-label={abierto ? "Ocultar instituciones" : "Ver instituciones"}
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 700, color: sinConfigurar ? "warning.dark" : undefined }}>{dispositivo.tipo}</TableCell>
        <TableCell align="right" sx={{ fontWeight: 700 }}>
          {dispositivo.ninos}
        </TableCell>
        <TableCell align="right">{dispositivo.instituciones.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} sx={{ py: 0, border: abierto ? undefined : "none" }}>
          <Collapse in={abierto} unmountOnExit>
            <Box sx={{ py: 1.5, pl: 6 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Institución / Familia</TableCell>
                    <TableCell align="right">Niños</TableCell>
                    <TableCell>Legajos y medidas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dispositivo.instituciones.map((institucion) => (
                    <TableRow key={institucion.nombre}>
                      <TableCell>{institucion.nombre}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {institucion.ninos}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" gap={0.5} flexWrap="wrap">
                          {institucion.medidas.map((medida) => (
                            <Chip
                              key={medida.id}
                              size="small"
                              variant="outlined"
                              label={`${medida.numeroLegajo ?? "s/legajo"} · ${medida.numeroMedida}`}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default function DispositivosPage() {
  const [tipoMedida, setTipoMedida] = useState<NonNullable<FiltroDispositivos["tipoMedida"]>>("TODAS")
  const [zona, setZona] = useState("")
  const [texto, setTexto] = useState("")

  const { isLoading, error, todas } = useIndicadoresData({})

  const zonas = useMemo(
    () => Array.from(new Set(todas.map((m) => m.zona).filter((z): z is string => Boolean(z)))).sort((a, b) => a.localeCompare(b, "es")),
    [todas],
  )

  const { dispositivos, totalNinos, totalMedidas } = useMemo(
    () => contarNinosPorDispositivo(todas, { tipoMedida, zona: zona || undefined, texto }),
    [todas, tipoMedida, zona, texto],
  )

  const sinConfigurar = dispositivos.find((d) => d.tipo === SIN_DISPOSITIVO)?.ninos ?? 0

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <HomeWorkIcon color="primary" fontSize="large" />
        <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
          Niños por dispositivo
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cuántos niños hay hoy en cada dispositivo, según la <strong>Configuración de Dispositivo</strong> de sus medidas vigentes. Un niño con más de una medida
        vigente en el mismo dispositivo se cuenta una vez.
      </Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="center">
          <TextField select size="small" label="Tipo de medida" value={tipoMedida} onChange={(e) => setTipoMedida(e.target.value as typeof tipoMedida)} sx={{ minWidth: 190 }}>
            {TIPOS_MEDIDA.map((t) => (
              <MenuItem key={t.valor} value={t.valor}>
                {t.etiqueta}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Zona" value={zona} onChange={(e) => setZona(e.target.value)} sx={{ minWidth: 240 }}>
            <MenuItem value="">Todas las zonas</MenuItem>
            {zonas.map((z) => (
              <MenuItem key={z} value={z}>
                {z}
              </MenuItem>
            ))}
          </TextField>
          <TextField size="small" label="Buscar dispositivo o institución" value={texto} onChange={(e) => setTexto(e.target.value)} sx={{ minWidth: 280 }} />
        </Stack>
      </Paper>

      {error && <Alert severity="error">No se pudieron cargar las medidas. Probá de nuevo en un momento.</Alert>}

      {isLoading && <Skeleton variant="rounded" height={220} />}

      {!isLoading && !error && (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <Paper elevation={0} sx={{ p: 2, minWidth: 170, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {totalNinos}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Niños con medida vigente
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 2, minWidth: 170, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {dispositivos.filter((d) => d.tipo !== SIN_DISPOSITIVO).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tipos de dispositivo en uso
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 2, minWidth: 170, borderRadius: 2, border: "1px solid", borderColor: sinConfigurar ? "warning.main" : "divider" }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {sinConfigurar}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sin dispositivo configurado
              </Typography>
            </Paper>
          </Stack>

          {dispositivos.length === 0 ? (
            <Alert severity="info">No hay medidas vigentes que coincidan con los filtros.</Alert>
          ) : (
            <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Tipo de dispositivo</TableCell>
                    <TableCell align="right">Niños</TableCell>
                    <TableCell align="right">Instituciones / familias</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dispositivos.map((dispositivo) => (
                    <FilaDispositivo key={dispositivo.tipo} dispositivo={dispositivo} />
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            {totalMedidas} medidas vigentes consideradas. «Sin dispositivo configurado» son medidas a las que todavía no se les cargó el dispositivo (se configura al registrar la intervención de apertura o con el botón Configurar de la medida).
          </Typography>
        </>
      )}
    </Box>
  )
}
