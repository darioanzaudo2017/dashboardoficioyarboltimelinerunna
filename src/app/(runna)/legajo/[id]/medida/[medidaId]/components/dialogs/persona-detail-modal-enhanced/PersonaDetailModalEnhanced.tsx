"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { useQueryClient } from "@tanstack/react-query"
import { buildFullAddress } from "../../../api/localizacion-api-service"
import { getUrgenciaNombre } from "@/app/(runna)/legajo-mesa/utils/legajo-detail-normalizers"
import { calculateAge } from "@/utils/dateUtils"
import { initialFormState } from "./constants"
import { buildDisplayData, getAvatarColor } from "./utils"
import { usePersonaDetailData } from "./hooks/usePersonaDetailData"
import { usePersonaEditForm } from "./hooks/usePersonaEditForm"
import { buildPersonaFormState } from "./form/buildPersonaFormState"
import { persistPersonaChanges } from "./form/persistPersonaChanges"
import { TabPanel } from "./parts/TabPanel"
import { PersonaDetailHeader } from "./parts/PersonaDetailHeader"
import { PersonaDetailTabs } from "./parts/PersonaDetailTabs"
import { TabPersonal } from "./parts/TabPersonal"
import { TabUbicacion } from "./parts/TabUbicacion"
import { TabEducacion } from "./parts/TabEducacion"
import { TabSalud } from "./parts/TabSalud"
import { TabVulnerabilidad } from "./parts/TabVulnerabilidad"
import { TabFamilia } from "./parts/TabFamilia"
import { TabLegajo } from "./parts/TabLegajo"
import { TabContexto } from "./parts/TabContexto"
import type { PersonaDetailModalProps } from "./types"

export default function PersonaDetailModalEnhanced({
  open,
  onClose,
  legajoData,
  readOnly = false,
  onEdit,
}: PersonaDetailModalProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"))
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(0)
  const {
    isEditing,
    setIsEditing,
    isEditingVulnerability,
    setIsEditingVulnerability,
    isSaving,
    setIsSaving,
    formData,
    setFormData,
    initialFormValues,
    handleFieldChange,
  } = usePersonaEditForm()

  // Extract data
  const persona = legajoData?.persona
  const legajo = legajoData?.legajo
  const urgenciaNombre = getUrgenciaNombre(legajo?.urgencia)
  const asignaciones = legajoData?.asignaciones_activas || []
  const medidasActivas = legajoData?.medidas_activas || []
  const demandas = legajoData?.demandas_relacionadas
  const permisos = legajoData?.permisos_usuario
  const personaId = persona?.id
  const legajoId = legajo?.id

  const {
    nnyaData,
    localizacion,
    educacion,
    saludData,
    loadingLocalizacion,
    loadingEducacion,
    loadingSalud,
    vulnerabilidadData,
    loadingVulnerabilidad,
    dropdownData,
    loadingDropdowns,
  } = usePersonaDetailData({
    open,
    legajoId,
    personaId,
    activeTab,
    isEditing,
    isEditingVulnerability,
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // Initialize form data when entering edit mode
  const initializeFormData = () => {
    const initialData = buildPersonaFormState({
      nnyaData,
      persona,
      localizacion,
      educacion,
      saludData,
      vulnerabilidadData,
    })

    setFormData(initialData)
    return initialData
  }

  // Handle entering edit mode
  const handleEnterEditMode = () => {
    const initialData = initializeFormData()
    // Store initial values for change detection
    initialFormValues.current = initialData
    setIsEditing(true)
  }

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData(initialFormState)
  }

  // Handle saving changes
  const handleSave = async () => {
    await persistPersonaChanges({
      legajo,
      formData,
      initialFormValues: initialFormValues.current,
      queryClient,
      setIsSaving,
      setIsEditing,
    })
  }

  // Create display data that prioritizes nnyaData (most recent) over persona (from prop)
  // This ensures UI updates immediately when nnyaData cache is updated after PATCH
  const displayData = buildDisplayData(nnyaData, persona)

  // Calculate edad from display data
  const edad = displayData.fecha_nacimiento
    ? calculateAge(displayData.fecha_nacimiento)
    : displayData.edad_aproximada ?? displayData.edad_calculada ?? null

  // Get avatar color from display data
  const avatarColor = getAvatarColor(displayData.nombre)

  // Full address for location tab
  const fullAddress = localizacion ? buildFullAddress(localizacion) : "N/A"

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: fullScreen ? 0 : 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <PersonaDetailHeader
          avatarColor={avatarColor}
          displayData={displayData}
          edad={edad}
          urgenciaNombre={urgenciaNombre}
          asignaciones={asignaciones}
          onClose={onClose}
        />
      </DialogTitle>

      <Divider />

      <PersonaDetailTabs activeTab={activeTab} handleTabChange={handleTabChange} fullScreen={fullScreen} />

      <DialogContent sx={{ p: 0 }}>
        {/* Tab 0: Información Personal */}
        <TabPanel value={activeTab} index={0}>
          <TabPersonal
            readOnly={readOnly}
            permisos={permisos}
            isEditing={isEditing}
            isSaving={isSaving}
            handleEnterEditMode={handleEnterEditMode}
            handleCancelEdit={handleCancelEdit}
            handleSave={handleSave}
            formData={formData}
            handleFieldChange={handleFieldChange}
            displayData={displayData}
            edad={edad}
            nnyaData={nnyaData}
          />
        </TabPanel>

        {/* Tab 1: Ubicación y Contacto */}
        <TabPanel value={activeTab} index={1}>
          <TabUbicacion
            readOnly={readOnly}
            permisos={permisos}
            isEditing={isEditing}
            isSaving={isSaving}
            handleEnterEditMode={handleEnterEditMode}
            handleCancelEdit={handleCancelEdit}
            handleSave={handleSave}
            formData={formData}
            handleFieldChange={handleFieldChange}
            loadingLocalizacion={loadingLocalizacion}
            loadingDropdowns={loadingDropdowns}
            dropdownData={dropdownData}
            localizacion={localizacion}
            fullAddress={fullAddress}
            persona={persona}
          />
        </TabPanel>

        {/* Tab 2: Información Educativa */}
        <TabPanel value={activeTab} index={2}>
          <TabEducacion
            readOnly={readOnly}
            permisos={permisos}
            isEditing={isEditing}
            isSaving={isSaving}
            handleEnterEditMode={handleEnterEditMode}
            handleCancelEdit={handleCancelEdit}
            handleSave={handleSave}
            formData={formData}
            handleFieldChange={handleFieldChange}
            loadingEducacion={loadingEducacion}
            loadingDropdowns={loadingDropdowns}
            dropdownData={dropdownData}
            educacion={educacion}
          />
        </TabPanel>

        {/* Tab 3: Información de Salud */}
        <TabPanel value={activeTab} index={3}>
          <TabSalud
            readOnly={readOnly}
            permisos={permisos}
            isEditing={isEditing}
            isSaving={isSaving}
            handleEnterEditMode={handleEnterEditMode}
            handleCancelEdit={handleCancelEdit}
            handleSave={handleSave}
            formData={formData}
            handleFieldChange={handleFieldChange}
            loadingSalud={loadingSalud}
            loadingDropdowns={loadingDropdowns}
            dropdownData={dropdownData}
            saludData={saludData}
          />
        </TabPanel>

        {/* Tab 4: Condiciones de Vulnerabilidad */}
        <TabPanel value={activeTab} index={4}>
          <TabVulnerabilidad
            readOnly={readOnly}
            permisos={permisos}
            isEditingVulnerability={isEditingVulnerability}
            setIsEditingVulnerability={setIsEditingVulnerability}
            loadingVulnerabilidad={loadingVulnerabilidad}
            personaId={personaId}
            persona={persona}
            vulnerabilidadData={vulnerabilidadData}
            dropdownData={dropdownData}
            loadingDropdowns={loadingDropdowns}
          />
        </TabPanel>

        {/* Tab 5: Familia / Personas Relacionadas */}
        <TabPanel value={activeTab} index={5}>
          <TabFamilia legajo={legajo} persona={persona} readOnly={readOnly} />
        </TabPanel>

        {/* Tab 6: Información del Legajo */}
        <TabPanel value={activeTab} index={6}>
          <TabLegajo legajo={legajo} urgenciaNombre={urgenciaNombre} asignaciones={asignaciones} />
        </TabPanel>

        {/* Tab 7: Contexto Adicional */}
        <TabPanel value={activeTab} index={7}>
          <TabContexto medidasActivas={medidasActivas} demandas={demandas} permisos={permisos} />
        </TabPanel>
      </DialogContent>
    </Dialog>
  )
}
