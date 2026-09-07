"use client"

import { useState, useRef } from "react"
import { initialFormState } from "../constants"
import type { PersonaFormState } from "../types"

/**
 * Estado del formulario de edición inline del modal de persona.
 * Los hooks se declaran en el mismo orden que tenían en el componente original.
 */
export function usePersonaEditForm() {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingVulnerability, setIsEditingVulnerability] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<PersonaFormState>(initialFormState)
  // Store initial values to track changes for PATCH requests
  const initialFormValues = useRef<PersonaFormState>(initialFormState)

  // Handle form field change
  const handleFieldChange = (field: keyof PersonaFormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return {
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
  }
}

export type PersonaEditForm = ReturnType<typeof usePersonaEditForm>
