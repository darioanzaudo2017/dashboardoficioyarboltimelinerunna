"use client"

/**
 * Búsqueda rápida de Oficios.
 *
 * "Oficio" no es una entidad propia en el sistema: es una demanda cargada
 * como CARGA_OFICIOS/PETICION_DE_INFORME, vinculada sí o sí a una medida, que
 * genera actividades de Plan de Trabajo y/o Control de Legalidad con
 * `oficio_origen.id` apuntando a esa demanda.
 *
 * Fuente de datos: una única búsqueda server-side en `GET /medidas-all/?search=`.
 * El backend filtra por identificadores de medida, legajo y demanda, y cada
 * actividad incluye los identificadores reales de su oficio de origen.
 *
 * Un oficio se considera "Contestado" cuando TODAS las actividades que
 * generó llegaron a un estado terminal (ver `lib/buscar-oficios.ts`).
 */
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Alert,
  Box,
  Chip,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import DescriptionIcon from "@mui/icons-material/Description"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PendingIcon from "@mui/icons-material/Pending"
import { buscarMedidasConOficios } from "./api/oficios-api-service"
import { armarMedidasConOficios, buscarPorIdentificador, OBJETIVO_LABELS } from "./lib/buscar-oficios"
import { ActividadNode } from "../legajo/[id]/medida/[medidaId]/components/medida/arbol/actividad-node"
import { BarraAvanceOficio } from "./components/BarraAvanceOficio"

export default function OficiosPage() {
  const [query, setQuery] = useState("")
  const [queryDiferida, setQueryDiferida] = useState("")

  useEffect(() => {
    const timer = window.setTimeout(() => setQueryDiferida(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const medidasQuery = useQuery({
    queryKey: ["oficios-busqueda", queryDiferida],
    queryFn: () => buscarMedidasConOficios(queryDiferida),
    enabled: queryDiferida.length >= 2,
    staleTime: 1000 * 60 * 5,
  })

  const isLoading = medidasQuery.isFetching
  const error = medidasQuery.error ?? null

  const medidasConOficios = useMemo(() => {
    if (!medidasQuery.data) return []
    return armarMedidasConOficios(medidasQuery.data)
  }, [medidasQuery.data])

  const resultados = useMemo(() => {
    if (queryDiferida.length < 2) return []
    return buscarPorIdentificador(medidasConOficios, queryDiferida)
  }, [medidasConOficios, queryDiferida])

  const totalOficiosEncontrados = resultados.reduce((acc, r) => acc + r.oficios.length, 0)

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Búsqueda rápida de Oficios
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Buscá por SAC/expediente/oficio web del oficio, SAC de la medida, número de medida o número de
        legajo. Un oficio queda <strong>Contestado</strong> cuando todas sus actividades vinculadas llegaron a
        la condición correspondiente: <strong>Completada</strong> si no necesita visado o{' '}
        <strong>Visado Aprobado</strong> cuando requiere la cadena JZ/Dirección y Legales. Las actividades
        canceladas no acreditan una respuesta.
      </Typography>

      <TextField
        fullWidth
        placeholder="Ej: 43534, 34534, MED-2026-045, LEG-2026-0093..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar datos: {(error as Error).message}
        </Alert>
      )}

      {isLoading && (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={140} />
        </Stack>
      )}

      {!isLoading && !error && queryDiferida.length >= 2 && resultados.length === 0 && (
        <Alert severity="warning">
          No se encontró ningún oficio ni medida con &quot;{queryDiferida}&quot;. Probá con el SAC/expediente/oficio
          web del oficio, el SAC de la medida, el número de medida (ej. MED-2026-045) o el número de legajo
          (ej. LEG-2026-0093).
        </Alert>
      )}

      {!isLoading && !error && resultados.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          {resultados.length} {resultados.length === 1 ? "medida encontrada" : "medidas encontradas"} ·{" "}
          {totalOficiosEncontrados} {totalOficiosEncontrados === 1 ? "oficio vinculado" : "oficios vinculados"}
        </Typography>
      )}

      {resultados.map(({ medida, oficios }) => (
        <Paper
          key={medida.id}
          elevation={0}
          sx={{ p: 2.5, mb: 2.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {medida.tipo_medida_display} {medida.numero_medida}
            </Typography>
            <Chip
              label={medida.estado_vigencia_display}
              size="small"
              color={medida.estado_vigencia === "VIGENTE" ? "primary" : "default"}
            />
            {medida.nro_sac && <Chip label={`SAC medida: ${medida.nro_sac}`} size="small" variant="outlined" />}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Legajo {medida.legajo?.numero ?? "—"}
            {medida.legajo?.nnya && ` — ${medida.legajo.nnya.nombre} ${medida.legajo.nnya.apellido}`}
          </Typography>

          {oficios.length === 0 ? (
            <Typography variant="body2" color="text.disabled">
              Esta medida no tiene oficios vinculados en su plan de trabajo.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {oficios.map((oficio) => (
                <Box
                  key={oficio.oficioId}
                  sx={{ p: 2, borderRadius: 1.5, bgcolor: "grey.50", border: "1px solid", borderColor: "divider" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                    <DescriptionIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Oficio #{oficio.oficioId}
                    </Typography>
                    <Chip label={OBJETIVO_LABELS[oficio.objetivo] ?? oficio.objetivo} size="small" variant="outlined" />
                    <Chip
                      icon={oficio.contestado ? <CheckCircleIcon /> : <PendingIcon />}
                      label={oficio.contestado ? "Contestado" : "Pendiente"}
                      size="small"
                      color={oficio.contestado ? "success" : "warning"}
                    />
                    <Chip
                      label={`${oficio.actividades.length} ${oficio.actividades.length === 1 ? "actividad" : "actividades"}`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Box sx={{ mb: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {oficio.actividadesCompletas} de {oficio.actividadesTotal} actividades completas
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }} color="text.secondary">
                        {oficio.actividadesTotal > 0
                          ? Math.round((oficio.actividadesCompletas / oficio.actividadesTotal) * 100)
                          : 0}%
                      </Typography>
                    </Stack>
                    <BarraAvanceOficio actividades={oficio.actividades} />
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
                    {oficio.numeroExpediente && (
                      <Typography variant="caption" color="text.secondary">
                        Expediente/SAC: <strong>{oficio.numeroExpediente}</strong>
                      </Typography>
                    )}
                    {oficio.nroOficioWeb && (
                      <Typography variant="caption" color="text.secondary">
                        Oficio Web: <strong>{oficio.nroOficioWeb}</strong>
                      </Typography>
                    )}
                    {oficio.nroSacDemanda && (
                      <Typography variant="caption" color="text.secondary">
                        SAC del oficio: <strong>{oficio.nroSacDemanda}</strong>
                      </Typography>
                    )}
                    {!oficio.numeroExpediente && !oficio.nroOficioWeb && !oficio.nroSacDemanda && (
                      <Typography variant="caption" color="text.disabled">
                        Sin SAC/expediente/oficio web cargado en la demanda de origen.
                      </Typography>
                    )}
                  </Stack>
                  <Stack spacing={1}>
                    {oficio.actividades.map((actividad) => (
                      <ActividadNode key={actividad.id} actividad={actividad} />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      ))}
    </Box>
  )
}
