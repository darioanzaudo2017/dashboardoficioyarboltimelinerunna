"use client"

import type React from "react"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { RepositorioDocumentosSection } from "./repositorio-documentos"

interface DocumentosSectionProps {
  legajoData: LegajoDetailResponse
  isLoadingEnhancements?: boolean
}

export const DocumentosSection: React.FC<DocumentosSectionProps> = ({ legajoData }) => {
  return (
    <RepositorioDocumentosSection
      legajoId={legajoData.legajo.id}
      puedeAgregarDocumentos={false}
    />
  )
}
