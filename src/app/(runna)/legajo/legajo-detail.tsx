"use client"
import { useState } from "react"
import type React from "react"

import { CircularProgress, Typography, IconButton, Box, Alert, Button, Tabs, Tab, AlertTitle } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ArticleIcon from "@mui/icons-material/Article"
import RefreshIcon from "@mui/icons-material/Refresh"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { fetchLegajoDetail, updateLegajoDatosPersonales } from "../legajo-mesa/api/legajos-api-service"
import type { PersonaDetailData } from "../legajo-mesa/types/legajo-api"
import { useUser } from "@/utils/auth/userZustand"
import { EditDatosPersonalesDialog } from "./[id]/medida/[medidaId]/components/dialogs/edit-datos-personales-dialog"
import { CrearMedidaDialog } from "./[id]/medida/[medidaId]/components/dialogs/crear-medida-dialog"
import { DatosPersonalesSection } from "./[id]/medida/[medidaId]/components/legajo/datos-personales-section"
import { LegajoHeader } from "./[id]/medida/[medidaId]/components/legajo/legajo-header"
import { getDefaultBreadcrumbs, NavigationBreadcrumbs } from "./[id]/medida/[medidaId]/components/navigation-breadcrumbs"
// New components
import { AsignacionesSection } from "./[id]/medida/[medidaId]/components/legajo/asignaciones-section"
import { OficiosSection } from "./[id]/medida/[medidaId]/components/legajo/oficios-section"
import { DemandasSection } from "./[id]/medida/[medidaId]/components/legajo/demandas-section"
import { DocumentosSection } from "./[id]/medida/[medidaId]/components/legajo/documentos-section"
import { ResponsablesSection } from "./[id]/medida/[medidaId]/components/legajo/responsables-section"
import { HistorialCambiosSection } from "./[id]/medida/[medidaId]/components/legajo/historial-cambios-section"
import { PlanTrabajoSection } from "./[id]/medida/[medidaId]/components/legajo/plan-trabajo-section"
import { HistorialAsignacionesSection } from "./[id]/medida/[medidaId]/components/legajo/historial-asignaciones-section"
import { MedidasActivasSection } from "./[id]/medida/[medidaId]/components/legajo/medidas-activas-section"
import PersonaDetailModalEnhanced from "./[id]/medida/[medidaId]/components/dialogs/persona-detail-modal-enhanced"

// Importar tipos
import { getMedidasByLegajo } from "../legajo-mesa/api/medidas-api-service"

interface LegajoDetailProps {
  params: {
    id: string
  }
  onClose?: () => void
  isFullPage?: boolean
}

export default function LegajoDetail({ params, onClose, isFullPage = false }: LegajoDetailProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [openEditDatosDialog, setOpenEditDatosDialog] = useState(false)
  const [openCrearMedidaDialog, setOpenCrearMedidaDialog] = useState(false)
  const [openPersonaCompletaModal, setOpenPersonaCompletaModal] = useState(false)
  const [medidasRefreshTrigger, setMedidasRefreshTrigger] = useState(0)

  const router = useRouter()
  const { user } = useUser()

  // Admins (is_superuser o is_staff) tienen acceso completo
  const isAdmin = user?.is_superuser || user?.is_staff

  // El detalle canónico ya incluye oficios, demandas relacionadas y el
  // repositorio de documentos. Mantener una única consulta evita el anterior
  // patrón N+1 que pedía full-detail por cada demanda relacionada.
  const {
    data: legajoData,
    isLoading,
    error: queryError,
    refetch: loadLegajoData,
  } = useQuery({
    queryKey: ['legajo', params.id],
    queryFn: () => fetchLegajoDetail(Number(params.id), { include_history: false }),
    enabled: !!params.id,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    retry: 1,
  })

  // Prefetch medidas data in parallel (eliminates queuing)
  const { data: prefetchedMedidas } = useQuery({
    queryKey: ['legajo', params.id, 'medidas', { _refresh: medidasRefreshTrigger }],
    queryFn: () => getMedidasByLegajo(Number(params.id), {}),
    enabled: !!legajoData?.legajo?.id,
    staleTime: 2 * 60 * 1000,
  })

  // Convert query error to string
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message.includes("404")
        ? "No se encontró el legajo solicitado."
        : queryError.message.includes("403")
        ? "No tienes permisos para ver este legajo."
        : queryError.message.includes("Network") || queryError.message.includes("fetch")
        ? "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
        : `Error al cargar los datos: ${queryError.message}`
      : "Error al cargar los datos del legajo. Por favor, intente nuevamente."
    : null

  const handleOpenInFullPage = () => {
    router.push(`/legajo/${params.id}`)
  }

  const handleCrearMedidaSuccess = () => {
    // Trigger refresh of medidas section
    setMedidasRefreshTrigger(prev => prev + 1)

    // Also reload legajo data
    loadLegajoData()
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleViewAllPersonalData = () => {
    setOpenPersonaCompletaModal(true)
  }

  const handleEditDatosPersonales = () => {
    setOpenEditDatosDialog(true)
  }

  const handleSaveDatosPersonales = async (updatedPersona: Partial<PersonaDetailData>) => {
    if (!params.id) return

    try {
      // Call API to update datos personales
      await updateLegajoDatosPersonales(Number(params.id), updatedPersona)

      // Reload legajo data to reflect changes
      loadLegajoData()

      setOpenEditDatosDialog(false)
    } catch (error) {
      console.error("Error saving datos personales:", error)
      throw error // Let the dialog handle the error display
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando información del legajo...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => void loadLegajoData()}
            >
              Reintentar
            </Button>
          }
        >
          <AlertTitle>Error al cargar el legajo</AlertTitle>
          {error}
        </Alert>
      </Box>
    )
  }

  if (!legajoData) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No se encontró información para este legajo.
      </Alert>
    )
  }

  // Prepare breadcrumb items
  const breadcrumbItems = [...getDefaultBreadcrumbs()]
  const puedeEditarPersona = isAdmin || legajoData.permisos_usuario?.puede_editar
  const sacSugeridos = Array.from(new Set([
    ...(legajoData.demandas_relacionadas?.resultados || []).map((demanda) => demanda.nro_sac),
    ...(legajoData.historial_medidas || []).map((medida) => medida.nro_sac),
  ].filter((sac): sac is string => Boolean(sac?.trim()))))

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        ...(isFullPage && {
          display: "flex",
          justifyContent: "center",
        }),
      }}
    >
      <Box
        sx={{
          p: 3,
          ...(isFullPage && {
            maxWidth: "1200px",
            width: "100%",
          }),
        }}
      >
        {!isFullPage ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton aria-label="Ver en página completa" onClick={handleOpenInFullPage} color="primary">
              <ArticleIcon />
            </IconButton>
            {onClose && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <NavigationBreadcrumbs items={breadcrumbItems} currentPage={`Legajo ${params.id}`} />
          </Box>
        )}

        <LegajoHeader legajoData={legajoData} onViewAllPersonalData={handleViewAllPersonalData} />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AccountTreeIcon />}
            onClick={() => router.push(`/legajo/${params.id}/arbol`)}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Ver Árbol del Legajo
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Secciones del legajo"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
              },
            }}
          >
            <Tab label="General" />
            <Tab label="Asignaciones" />
            <Tab label="Oficios" />
            <Tab label="Demandas" />
            <Tab label="Documentos" />
            <Tab label="Plan de Trabajo" />
            {(isAdmin || legajoData.permisos_usuario?.puede_ver_historial) && <Tab label="Historial" />}
          </Tabs>
        </Box>

        {/* TAB 0: General (Datos Personales + Medidas Activas) */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <DatosPersonalesSection legajoData={legajoData} onEdit={handleEditDatosPersonales} />
            <MedidasActivasSection
              legajoData={legajoData}
              prefetchedMedidas={prefetchedMedidas}
              onAddMedida={() => setOpenCrearMedidaDialog(true)}
              showAddButton={isAdmin || legajoData.permisos_usuario?.puede_tomar_medidas || false}
              refreshTrigger={medidasRefreshTrigger}
            />
          </Box>
        )}

        {/* TAB 1: Asignaciones (Asignaciones Activas + Responsables + Historial) */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AsignacionesSection legajoData={legajoData} />
            <ResponsablesSection legajoData={legajoData} />
            <HistorialAsignacionesSection legajoData={legajoData} />
          </Box>
        )}

        {/* TAB 2: Oficios */}
        {activeTab === 2 && (
          <>
            <OficiosSection legajoData={legajoData} />
          </>
        )}

        {/* TAB 3: Demandas */}
        {activeTab === 3 && (
          <>
            <DemandasSection legajoData={legajoData} />
          </>
        )}

        {/* TAB 4: Documentos */}
        {activeTab === 4 && (
          <>
            <DocumentosSection legajoData={legajoData} />
          </>
        )}

        {/* TAB 5: Plan de Trabajo */}
        {activeTab === 5 && (
          <>
            <PlanTrabajoSection legajoData={legajoData} />
          </>
        )}

        {/* TAB 6: Auditoría (Historial de Cambios) - Solo con permiso o admin */}
        {activeTab === 6 && (isAdmin || legajoData.permisos_usuario?.puede_ver_historial) && (
          <>
            <HistorialCambiosSection legajoData={legajoData} />
          </>
        )}
      </Box>

      {/* Dialogs */}
      <EditDatosPersonalesDialog
        open={openEditDatosDialog}
        persona={legajoData?.persona || null}
        onClose={() => setOpenEditDatosDialog(false)}
        onSave={handleSaveDatosPersonales}
      />

      <CrearMedidaDialog
        open={openCrearMedidaDialog}
        legajoId={Number(params.id)}
        sacOptions={sacSugeridos}
        onClose={() => setOpenCrearMedidaDialog(false)}
        onSuccess={handleCrearMedidaSuccess}
      />

      <PersonaDetailModalEnhanced
        open={openPersonaCompletaModal}
        onClose={() => setOpenPersonaCompletaModal(false)}
        legajoData={legajoData}
        readOnly={!puedeEditarPersona}
      />
    </Box>
  )
}
