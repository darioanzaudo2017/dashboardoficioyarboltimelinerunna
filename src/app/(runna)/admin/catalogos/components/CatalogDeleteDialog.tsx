"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material"
import { AlertTriangle } from "lucide-react"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { remove, update } from "@/app/api/apiService"
import { handleApiError } from "@/app/api/utils/errorHandler"
import type { CatalogConfig } from "../types/catalogos.types"

interface CatalogDeleteDialogProps {
  open: boolean
  onClose: () => void
  catalog: CatalogConfig
  itemToDelete?: Record<string, any> | null
  onSuccess?: () => void
}

export const CatalogDeleteDialog: React.FC<CatalogDeleteDialogProps> = ({
  open,
  onClose,
  catalog,
  itemToDelete,
  onSuccess,
}) => {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const itemName =
    itemToDelete?.nombre ||
    itemToDelete?.label ||
    itemToDelete?.codigo ||
    itemToDelete?.obra_social ||
    (itemToDelete?.id ? `#${itemToDelete.id}` : "este registro")

  const isSoftDelete = Boolean(catalog.softDeleteField)
  const actionVerb = isSoftDelete ? "desactivar" : "eliminar"

  const handleDelete = async () => {
    if (!itemToDelete?.id) return

    setIsDeleting(true)
    try {
      // Los catálogos con baja lógica (activo/inactivo) se desactivan en vez de
      // borrarse físicamente: ya tienen actividades/legajos reales que los
      // referencian por FK, y un DELETE podría romperlos o quedar rechazado
      // igual por el backend.
      if (catalog.softDeleteField) {
        await update(catalog.endpoint, itemToDelete.id, { [catalog.softDeleteField]: false })
        toast.success(`${catalog.singularLabel || "Registro"} desactivado con éxito`)
      } else {
        await remove(catalog.endpoint, itemToDelete.id)
        toast.success(`${catalog.singularLabel || "Registro"} eliminado con éxito`)
      }

      queryClient.invalidateQueries({ queryKey: [catalog.endpoint] })
      if (catalog.parentKey) {
        queryClient.invalidateQueries({ queryKey: [catalog.parentKey] })
      }

      onSuccess?.()
      onClose()
    } catch (error: any) {
      handleApiError(error, catalog.endpoint)
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "No se pudo eliminar el registro. Es posible que tenga relaciones activas."
      toast.error(typeof detail === "string" ? detail : JSON.stringify(detail))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
          <AlertTriangle size={22} />
        </div>
        <div>
          <Typography variant="subtitle1" className="font-bold text-gray-900 leading-tight">
            {isSoftDelete ? "Confirmar desactivación" : "Confirmar eliminación"}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {catalog.singularLabel || catalog.label}
          </Typography>
        </div>
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        <DialogContentText className="text-gray-700 text-sm">
          ¿Estás seguro de que deseas {actionVerb} <strong>&quot;{itemName}&quot;</strong>?{" "}
          {isSoftDelete
            ? "Dejará de estar disponible para elegir en nuevos registros, pero no afecta lo ya cargado con este valor."
            : "Esta acción no se puede deshacer."}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5, pt: 1 }}>
        <Button
          onClick={onClose}
          disabled={isDeleting}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          variant="contained"
          color="error"
          startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ textTransform: "none", borderRadius: 2, px: 2.5 }}
        >
          {isDeleting ? (isSoftDelete ? "Desactivando..." : "Eliminando...") : isSoftDelete ? "Desactivar" : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
