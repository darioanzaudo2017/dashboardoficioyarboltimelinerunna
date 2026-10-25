"use client"

import type React from "react"
import { Snackbar, Paper, Typography, Box, Button, Chip, Stack, IconButton, Divider, Collapse } from "@mui/material"
import { alpha, keyframes } from "@mui/material/styles"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded"
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { create } from "@/app/api/apiService"
import { useUser } from "@/utils/auth/userZustand"
import { hasVinculacionAccess } from "@/utils/auth/permissionUtils"
import { logger } from "@/utils/logger"
import { normalizeMatchDescription } from "./utils/matchDescription"

// Llamado de atención: un anillo que se expande y un leve sacudón del ícono. Se repiten pocas veces
// (no para siempre) y sólo si el sistema del usuario no pidió reducir animaciones.
const ringPulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(237, 108, 2, 0.55); }
  70%  { box-shadow: 0 0 0 12px rgba(237, 108, 2, 0); }
  100% { box-shadow: 0 0 0 0 rgba(237, 108, 2, 0); }
`
const wiggle = keyframes`
  0%, 80%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-14deg); }
  30% { transform: rotate(12deg); }
  45% { transform: rotate(-8deg); }
  60% { transform: rotate(6deg); }
`

interface VinculacionResult {
  demanda_ids: number[]
  match_descriptions: string[]
  legajos?: Array<{
    id: number
    numero: string
    fecha_apertura: string
    nnya: number
    urgencia: string | null
  }>
}

interface VinculacionNotificationProps {
  open: boolean
  onClose: () => void
  vinculacionResults: VinculacionResult | null
  currentDemandaId?: string | number
  onVincularLegajo?: (legajoId: number, legajoNumero: string) => void // Callback to add legajo to VinculosManager
}

const VinculacionNotification: React.FC<VinculacionNotificationProps> = ({
  open,
  onClose,
  vinculacionResults,
  currentDemandaId,
  onVincularLegajo,
}) => {
  const params = useParams()
  const [shouldShow, setShouldShow] = useState(true)
  const [isVinculando, setIsVinculando] = useState(false)
  // Arranca colapsada: avisa sin ocupar lugar mientras se sigue completando el formulario
  const [expanded, setExpanded] = useState(false)
  const user = useUser((state) => state.user)

  // Check if user has permission to view/access connections
  const hasVinculacionPermission = hasVinculacionAccess(user)

  // Verificar si hay resultados (demandas o legajos)
  useEffect(() => {
    if (vinculacionResults) {
      const hasDemandas = vinculacionResults.demanda_ids && vinculacionResults.demanda_ids.length > 0
      const hasLegajos = vinculacionResults.legajos && vinculacionResults.legajos.length > 0

      if (hasDemandas || hasLegajos) {
        // Obtener el ID actual de la demanda desde props o params
        const actualDemandaId = currentDemandaId || params.id
        // Convertir a número para comparación
        const actualIdNum = actualDemandaId ? Number(actualDemandaId) : null

        // Verificar si la demanda actual está en los resultados
        // const isSameDemanda = actualIdNum && vinculacionResults.demanda_ids.includes(actualIdNum)
        // Siempre mostrar la notificación, independientemente de si es la misma demanda o no
        setShouldShow(true)
      } else {
        setShouldShow(false)
      }
    } else {
      setShouldShow(false)
    }
  }, [vinculacionResults, currentDemandaId, params.id])

  // If user doesn't have permission, don't show the notification
  if (!hasVinculacionPermission) {
    return null
  }

  // Si no hay resultados o no se debe mostrar, no renderizar nada
  if (!vinculacionResults || !shouldShow) return null

  // Verificar si hay algún resultado (demandas o legajos)
  const hasDemandas = vinculacionResults.demanda_ids && vinculacionResults.demanda_ids.length > 0
  const hasLegajos = vinculacionResults.legajos && vinculacionResults.legajos.length > 0

  if (!hasDemandas && !hasLegajos) return null

  // Se abren en una pestaña nueva: salir de la página en medio del registro haría perder el lugar
  // en el formulario (sólo queda el borrador guardado).
  const handleOpenDemanda = (demandaId: number) => {
    window.open(`/demanda/${demandaId}`, "_blank", "noopener,noreferrer")
  }

  const handleOpenLegajo = (legajoId: number) => {
    window.open(`/legajo/${legajoId}`, "_blank", "noopener,noreferrer")
  }

  // Función para vincular demandas
  const handleVincularDemanda = async (demandaId: number) => {
    // Obtener el ID actual de la demanda
    const actualDemandaId = currentDemandaId || params.id
    if (!actualDemandaId) return

    try {
      setIsVinculando(true)

      // Crear objeto para la vinculación
      const vinculacionData = {
        demanda_preexistente: Number(actualDemandaId),
        demanda_entrante: demandaId,
        deleted: false,
      }

      // Llamar a la API para crear la vinculación
      await create("demanda-vinculada", vinculacionData, true, "¡Demandas vinculadas con éxito!")

      // Cerrar la notificación después de vincular
      onClose()

      // Opcional: recargar la página o actualizar los datos
      // router.refresh()
    } catch (error) {
      logger.error("Error al vincular demandas:", error)
    } finally {
      setIsVinculando(false)
    }
  }

  // REG-01: Función para vincular legajo (pre-fill VinculosManager)
  const handleVincularLegajo = (legajoId: number, legajoNumero: string) => {
    if (onVincularLegajo) {
      onVincularLegajo(legajoId, legajoNumero)
      onClose() // Close notification after adding to VinculosManager
    }
  }

  const totalCount = vinculacionResults.demanda_ids.length + (vinculacionResults.legajos?.length || 0)

  return (
    <Snackbar
      open={open && shouldShow}
      autoHideDuration={null}
      onClose={onClose}
      // Abajo a la derecha: se puede usar pero no tapa la barra de navegación ni el formulario centrado
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ width: { xs: "calc(100% - 16px)", sm: "auto" } }}
    >
      <Paper
        elevation={8}
        sx={{
          width: { xs: "100%", sm: 380 },
          maxWidth: "calc(100vw - 16px)",
          borderRadius: 3,
          overflow: "hidden",
          // Tono de alerta: borde y fondo ámbar suave (no es un error, pero pide revisar)
          borderLeft: "5px solid",
          borderColor: "warning.main",
          backgroundImage: (theme) =>
            `linear-gradient(${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.1)})`,
        }}
      >
        {/* Header: al tocarlo se expande o se pliega el detalle */}
        <Box
          onClick={() => setExpanded((prev) => !prev)}
          sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, cursor: "pointer" }}
          role="button"
          aria-expanded={expanded}
          aria-label={expanded ? "Ocultar posibles coincidencias" : "Ver posibles coincidencias"}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "warning.dark",
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.2),
              // Se anima mientras está plegada (pide atención); al expandirla ya está leyéndola
              "@media (prefers-reduced-motion: no-preference)": {
                animation: expanded ? "none" : `${ringPulse} 1.6s ease-out 3, ${wiggle} 1.1s ease-in-out 3`,
              },
            }}
          >
            <WarningAmberRoundedIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.25}>
              Posibles coincidencias
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalCount} {totalCount === 1 ? "resultado" : "resultados"} · todavía no vinculadas
            </Typography>
          </Box>
          {expanded ? (
            <ExpandMoreRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
          ) : (
            <ExpandLessRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
          )}
          <IconButton
            size="small"
            aria-label="Cerrar aviso de coincidencias"
            onClick={(event) => {
              event.stopPropagation() // no debe también expandir/plegar
              onClose()
            }}
            sx={{ flexShrink: 0, color: "text.secondary" }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2, pt: 1.25 }}>
          Revisalas para evitar duplicados.
        </Typography>

        {/* Contenido scrolleable con scrollbar fino */}
        <Box
          sx={{
            maxHeight: { xs: "55vh", sm: "50vh" },
            overflowY: "auto",
            px: 2,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(0,0,0,0.18)", borderRadius: 3 },
            "&::-webkit-scrollbar-thumb:hover": { bgcolor: "rgba(0,0,0,0.3)" },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.18) transparent",
          }}
        >
          {/* Demandas */}
          {hasDemandas && (
            <Box sx={{ py: 1.5 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: 0.6, display: "block", mb: 0.5 }}
              >
                Demandas
              </Typography>
              {vinculacionResults.demanda_ids.map((demandaId, index) => (
                <Box
                  key={`demanda-${index}`}
                  sx={{
                    py: 1.25,
                    "&:not(:last-of-type)": { borderBottom: "1px solid", borderColor: "divider" },
                  }}
                >
                  <Typography variant="body2" sx={{ overflowWrap: "anywhere", lineHeight: 1.5 }}>
                    {normalizeMatchDescription(vinculacionResults.match_descriptions[index] ?? "")}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                    <Button onClick={() => handleOpenDemanda(demandaId)} size="small" variant="text">
                      Ver demanda
                    </Button>
                    {/* Al crear una demanda todavía no existe su ID: se explica cuándo se podrá vincular */}
                    {!(currentDemandaId || params.id) && (
                      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                        Podrás vincularla después de guardar, desde el detalle de la demanda.
                      </Typography>
                    )}
                    {/* Mostrar botón de vincular solo si hay un ID de demanda actual */}
                    {(currentDemandaId || params.id) && (
                      <Button
                        onClick={() => handleVincularDemanda(demandaId)}
                        size="small"
                        variant="contained"
                        color="primary"
                        disableElevation
                        disabled={isVinculando}
                      >
                        {isVinculando ? "Vinculando..." : "Vincular"}
                      </Button>
                    )}
                  </Stack>
                </Box>
              ))}
            </Box>
          )}

          {/* Legajos */}
          {hasLegajos && (
            <Box sx={{ py: 1.5, ...(hasDemandas && { borderTop: "1px solid", borderColor: "divider" }) }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: 0.6, display: "block", mb: 0.5 }}
              >
                Legajos
              </Typography>
              {vinculacionResults.legajos!.map((legajo, index) => (
                <Box
                  key={`legajo-${index}`}
                  sx={{
                    py: 1.25,
                    "&:not(:last-of-type)": { borderBottom: "1px solid", borderColor: "divider" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                      Legajo {legajo.numero}
                    </Typography>
                    {legajo.urgencia && (
                      <Chip
                        label={`Urgencia ${legajo.urgencia}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ flexShrink: 0, height: 22 }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>
                    Apertura: {new Date(legajo.fecha_apertura).toLocaleDateString("es-AR")}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                    <Button onClick={() => handleOpenLegajo(legajo.id)} size="small" variant="text">
                      Ver legajo
                    </Button>
                    {/* REG-01: Mostrar botón de vincular si hay callback (durante creación de demanda) */}
                    {onVincularLegajo && !currentDemandaId && !params.id && (
                      <Button
                        onClick={() => handleVincularLegajo(legajo.id, legajo.numero)}
                        size="small"
                        variant="contained"
                        color="primary"
                        disableElevation
                      >
                        Vincular
                      </Button>
                    )}
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        </Collapse>
      </Paper>
    </Snackbar>
  )
}

export default VinculacionNotification
