"use client"

import type React from "react"
import { useCallback } from "react"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { RepositorioDocumentosSection } from "./repositorio-documentos"

interface DocumentosSectionProps {
  legajoData: LegajoDetailResponse
  isLoadingEnhancements?: boolean
}

export const DocumentosSection: React.FC<DocumentosSectionProps> = ({ legajoData }) => {
  // Contención: el cargador anterior confirmaba éxito sin llamar a una API.
  // Se reactivará en la fase de persistencia con verificación posterior a recarga.
  const handleAgregarDocumento = useCallback(() => undefined, [])

  return (
    <>
      <RepositorioDocumentosSection
        legajoId={legajoData.legajo.id}
        puedeAgregarDocumentos={false}
        onAddDocumento={handleAgregarDocumento}
      />
    </>
  )
}
