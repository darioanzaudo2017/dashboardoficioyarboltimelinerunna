"use client"

/**
 * Árbol / línea de tiempo a nivel de LEGAJO: lista las medidas del legajo
 * (más vieja a más nueva) como nodos de primer nivel; al expandir una
 * medida se monta adentro exactamente el mismo contenido que la línea de
 * tiempo de la medida (`MedidaLineaTiempoContenido`) — no es una vista
 * distinta, es la misma, reusada.
 *
 * El contenido de cada medida solo se monta cuando se expande su acordeón
 * (unmountOnExit) para no disparar de entrada los fetches de las 5+ medidas
 * que puede tener un legajo con historia larga.
 */
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import GavelIcon from "@mui/icons-material/Gavel"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import { getMedidasByLegajo } from "../../legajo-mesa/api/medidas-api-service"
import type { MedidaBasicResponse } from "../../legajo-mesa/types/medida-api"
import { getDefaultBreadcrumbs, NavigationBreadcrumbs } from "./medida/[medidaId]/components/navigation-breadcrumbs"
import { MedidaLineaTiempoContenido } from "./medida/[medidaId]/components/medida/arbol/medida-linea-tiempo-contenido"
import { formatFechaSolo } from "./medida/[medidaId]/types/historial-seguimiento-api"

interface LegajoArbolViewProps {
  legajoId: string
}

export const LegajoArbolView: React.FC<LegajoArbolViewProps> = ({ legajoId }) => {
  const router = useRouter()
  const legajoIdNum = Number(legajoId)
  const isValidLegajoId = Number.isInteger(legajoIdNum) && legajoIdNum > 0

  const { data: medidas, isLoading, error } = useQuery({
    queryKey: ["legajo-arbol-medidas", legajoIdNum],
    queryFn: () => getMedidasByLegajo(legajoIdNum),
    enabled: isValidLegajoId,
    staleTime: 1000 * 60 * 2,
  })

  const medidasOrdenadas = useMemo(
    () =>
      [...(medidas ?? [])].sort(
        (a, b) => new Date(a.fecha_apertura).getTime() - new Date(b.fecha_apertura).getTime()
      ),
    [medidas]
  )

  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Al cargar, expandir la medida vigente más reciente (o la última si
  // ninguna está vigente) — mismo criterio que "cuál rama abrir de entrada"
  // usado en la línea de tiempo de una medida individual.
  useEffect(() => {
    if (medidasOrdenadas.length === 0) return
    const vigentes = medidasOrdenadas.filter((m) => m.estado_vigencia === "VIGENTE")
    const porDefecto = vigentes.length > 0 ? vigentes[vigentes.length - 1] : medidasOrdenadas[medidasOrdenadas.length - 1]
    setExpandedId(porDefecto.id)
    // Solo queremos el estado inicial una vez que llegan los datos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medidasOrdenadas.length, legajoIdNum])

  const handleBack = () => {
    router.push(`/legajo/${legajoId}`)
  }

  const breadcrumbItems = [
    ...getDefaultBreadcrumbs(),
    { label: `Legajo ${legajoId}`, path: `/legajo/${legajoId}` },
  ]

  if (!isValidLegajoId) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        ID de legajo inválido: &quot;{legajoId}&quot;
      </Alert>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ mb: 2 }}>
        <NavigationBreadcrumbs items={breadcrumbItems} currentPage="Árbol del Legajo" />
      </Box>

      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} size="small" sx={{ mb: 2, textTransform: "none" }}>
        Volver al legajo
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar las medidas del legajo: {(error as Error).message}
        </Alert>
      )}

      {isLoading && (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={90} />
          <Skeleton variant="rounded" height={90} />
        </Stack>
      )}

      {!isLoading && !error && (
        <>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <AccountTreeIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Legajo {legajoId}
            </Typography>
            <Chip
              label={`${medidasOrdenadas.length} ${medidasOrdenadas.length === 1 ? "medida" : "medidas"}`}
              size="small"
              variant="outlined"
            />
          </Stack>

          {medidasOrdenadas.length === 0 ? (
            <Alert severity="info">Este legajo todavía no tiene medidas registradas.</Alert>
          ) : (
            medidasOrdenadas.map((medida) => (
              <MedidaAccordionNode
                key={medida.id}
                medida={medida}
                expanded={expandedId === medida.id}
                onToggle={() => setExpandedId((prev) => (prev === medida.id ? null : medida.id))}
                legajoIdNum={legajoIdNum}
              />
            ))
          )}
        </>
      )}
    </Box>
  )
}

interface MedidaAccordionNodeProps {
  medida: MedidaBasicResponse
  expanded: boolean
  onToggle: () => void
  legajoIdNum: number
}

const MedidaAccordionNode: React.FC<MedidaAccordionNodeProps> = ({ medida, expanded, onToggle, legajoIdNum }) => {
  const estaVigente = medida.estado_vigencia === "VIGENTE"
  const rango = `${formatFechaSolo(medida.fecha_apertura)} — ${
    medida.fecha_cierre ? formatFechaSolo(medida.fecha_cierre) : "actualidad"
  }`

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      sx={{
        mb: 1.5,
        borderRadius: "10px !important",
        border: "1px solid",
        borderColor: estaVigente ? "primary.main" : "divider",
        "&:before": { display: "none" },
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: estaVigente ? "primary.50" : "background.paper",
          "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.5 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: estaVigente ? "primary.main" : "grey.300",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <GavelIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {medida.tipo_medida_display} {medida.numero_medida}
            </Typography>
            <Chip
              label={medida.estado_vigencia_display ?? medida.estado_vigencia}
              size="small"
              color={estaVigente ? "primary" : "default"}
              variant={estaVigente ? "filled" : "outlined"}
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
            <Chip
              label={`${medida.duracion_dias} días`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {rango}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: "grey.50", pt: 2 }}>
        {expanded && <MedidaLineaTiempoContenido medidaId={medida.id} legajoId={legajoIdNum} mostrarResumen={false} />}
      </AccordionDetails>
    </Accordion>
  )
}
