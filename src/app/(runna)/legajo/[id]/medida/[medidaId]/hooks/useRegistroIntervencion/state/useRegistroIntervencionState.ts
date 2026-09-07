"use client"

import { useState } from "react"
import { getCurrentDateISO } from "@/utils/dateUtils"
import type { TipoDispositivoWithSubtipos } from "../../../api/intervenciones-api-service"
import type {
  IntervencionResponse,
  AdjuntoIntervencion,
  MotivoIntervencion,
  SubMotivoIntervencion,
  CategoriaIntervencion,
} from "../../../types/intervencion-api"
import type { IntervencionFormData, ValidationErrors } from "../types"

/**
 * Estado del hook de registro de intervención.
 * Los useState se declaran en el mismo orden que tenían en el hook original.
 */
export function useRegistroIntervencionState(medidaId: number) {
  // ----------------------------------------------------------------------------
  // STATE - Form Data
  // ----------------------------------------------------------------------------
  const [formData, setFormData] = useState<IntervencionFormData>({
    medida: medidaId,
    fecha_intervencion: getCurrentDateISO(), // Hoy por defecto
    tipo_dispositivo_id: null,
    subtipo_dispositivo_id: null,
    tipo_cese: null,
    subtipo_cese: null,
    motivo_id: undefined,
    sub_motivo_id: null,
    categoria_intervencion_id: undefined,
    intervencion_especifica: "",
    descripcion_detallada: "",
    motivo_vulneraciones: "",
    requiere_informes_ampliatorios: false,
  })

  // ----------------------------------------------------------------------------
  // STATE - Intervención actual (cuando se edita)
  // ----------------------------------------------------------------------------
  const [intervencion, setIntervencion] = useState<IntervencionResponse | null>(null)

  // ----------------------------------------------------------------------------
  // STATE - Loading States
  // ----------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEnviando, setIsEnviando] = useState(false)
  const [isAprobando, setIsAprobando] = useState(false)
  const [isRechazando, setIsRechazando] = useState(false)
  const [isUploadingAdjunto, setIsUploadingAdjunto] = useState(false)
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false)

  // ----------------------------------------------------------------------------
  // STATE - Error States
  // ----------------------------------------------------------------------------
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // ----------------------------------------------------------------------------
  // STATE - Catalogs (tipo_dispositivo, motivo, etc.)
  // ----------------------------------------------------------------------------
  const [tiposDispositivo, setTiposDispositivo] = useState<TipoDispositivoWithSubtipos[]>([])
  const [motivos, setMotivos] = useState<MotivoIntervencion[]>([])
  const [subMotivos, setSubMotivos] = useState<SubMotivoIntervencion[]>([])
  const [categorias, setCategorias] = useState<CategoriaIntervencion[]>([])

  // ----------------------------------------------------------------------------
  // STATE - Adjuntos
  // ----------------------------------------------------------------------------
  const [adjuntos, setAdjuntos] = useState<AdjuntoIntervencion[]>([])
  const [isLoadingAdjuntos, setIsLoadingAdjuntos] = useState(false)

  return {
    formData,
    setFormData,
    intervencion,
    setIntervencion,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    isEnviando,
    setIsEnviando,
    isAprobando,
    setIsAprobando,
    isRechazando,
    setIsRechazando,
    isUploadingAdjunto,
    setIsUploadingAdjunto,
    isLoadingCatalogs,
    setIsLoadingCatalogs,
    error,
    setError,
    validationErrors,
    setValidationErrors,
    tiposDispositivo,
    setTiposDispositivo,
    motivos,
    setMotivos,
    subMotivos,
    setSubMotivos,
    categorias,
    setCategorias,
    adjuntos,
    setAdjuntos,
    isLoadingAdjuntos,
    setIsLoadingAdjuntos,
  }
}

export type RegistroIntervencionState = ReturnType<typeof useRegistroIntervencionState>
