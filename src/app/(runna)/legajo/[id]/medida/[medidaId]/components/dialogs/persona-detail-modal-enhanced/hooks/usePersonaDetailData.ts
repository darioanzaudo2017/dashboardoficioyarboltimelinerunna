"use client"

import { useQuery } from "@tanstack/react-query"
import { usePersonaCondicionesVulnerabilidad } from "../../../../hooks/usePersonaData"
import { useNNyAData } from "../../../../hooks/usePersonasRelacionadas"
import { fetchDropdownData } from "@/components/forms/utils/fetchFormCase"
import type { DropdownData } from "@/components/forms/types/formTypes"

interface UsePersonaDetailDataParams {
  open: boolean
  legajoId: number | undefined
  personaId: number | undefined
  activeTab: number
  isEditing: boolean
  isEditingVulnerability: boolean
}

/**
 * Consultas del modal de detalle de persona, en el mismo orden que en el
 * componente original: NNyA -> condiciones de vulnerabilidad -> dropdowns.
 */
export function usePersonaDetailData({
  open,
  legajoId,
  personaId,
  activeTab,
  isEditing,
  isEditingVulnerability,
}: UsePersonaDetailDataParams) {
  // Fetch NNyA data from unified endpoint (includes localizacion, educacion, cobertura_medica)
  const { data: nnyaData, isLoading: loadingNNyA } = useNNyAData(legajoId, {
    enabled: open && !!legajoId,
  })

  // Extract data from NNyA response
  const localizacion = nnyaData?.localizacion || null
  const educacion = nnyaData?.educacion || null
  const saludData = nnyaData ? {
    cobertura_medica: nnyaData.cobertura_medica || null,
    persona_enfermedades: nnyaData.persona_enfermedades || [],
  } : null

  // Loading states derived from NNyA loading
  const loadingLocalizacion = loadingNNyA
  const loadingEducacion = loadingNNyA
  const loadingSalud = loadingNNyA

  // Fetch vulnerability data (separate endpoint for now)
  const { data: vulnerabilidadData, isLoading: loadingVulnerabilidad } = usePersonaCondicionesVulnerabilidad(
    personaId,
    {
      enabled: open && !!personaId && activeTab === 4, // Only load when Vulnerability tab is active
    }
  )

  // Fetch dropdown data for edit mode
  const { data: dropdownData, isLoading: loadingDropdowns } = useQuery<DropdownData>({
    queryKey: ["registro-demanda-form-dropdowns"],
    queryFn: fetchDropdownData,
    enabled: open && (isEditing || isEditingVulnerability),
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  return {
    nnyaData,
    loadingNNyA,
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
  }
}

export type PersonaDetailData = ReturnType<typeof usePersonaDetailData>
