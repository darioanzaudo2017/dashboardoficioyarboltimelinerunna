import type { QueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { updateNNyAData } from "../../../../api/personas-relacionadas-api-service"
import { logger } from "@/utils/logger"
import { getModifiedFields } from "./getModifiedFields"
import type { PersonaFormState } from "../types"

interface PersistPersonaChangesParams {
  legajo: { id?: number } | undefined
  formData: PersonaFormState
  initialFormValues: PersonaFormState
  queryClient: QueryClient
  setIsSaving: (value: boolean) => void
  setIsEditing: (value: boolean) => void
}

// Handle saving changes
export const persistPersonaChanges = async ({
  legajo,
  formData,
  initialFormValues,
  queryClient,
  setIsSaving,
  setIsEditing,
}: PersistPersonaChangesParams) => {
    if (!legajo?.id) {
      toast.error("No se puede guardar: ID de legajo no disponible")
      return
    }

    setIsSaving(true)
    try {
      // Get only the modified fields for PATCH semantics
      const updateData = getModifiedFields(formData, initialFormValues)

      logger.log("[PersonaDetailModal] Sending PATCH with modified fields only:", updateData)

      // Only send PATCH if there are actually modified fields
      if (Object.keys(updateData).length === 0) {
        toast.info("No hay cambios para guardar")
        setIsEditing(false)
        setIsSaving(false)
        return
      }

      const updatedNNyAData = await updateNNyAData(legajo.id, updateData)
      logger.log("[PersonaDetailModal] Received PATCH response:", updatedNNyAData)
      toast.success("Datos actualizados correctamente")

      // Immediately update the nnya-data cache with the response for instant UI update
      queryClient.setQueryData(["nnya-data", legajo.id], updatedNNyAData)

      // Invalidate and refetch legajo-detail to update persona data in parent
      // This ensures the dialog header and other persona-based displays update
      await queryClient.invalidateQueries({
        queryKey: ["legajo-detail"],
        refetchType: "active"
      })

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["persona-localizacion"] })
      queryClient.invalidateQueries({ queryKey: ["persona-educacion"] })
      queryClient.invalidateQueries({ queryKey: ["persona-cobertura-medica"] })
      queryClient.invalidateQueries({ queryKey: ["persona-condiciones-vulnerabilidad"] })

      // Exit edit mode - component will re-render with updated data
      setIsEditing(false)
    } catch (error: any) {
      logger.error("[PersonaDetailModal] Error saving:", error)
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || "Error al guardar los cambios"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
}
