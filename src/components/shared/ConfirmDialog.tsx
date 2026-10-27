"use client"

import type React from "react"
import { Typography } from "@mui/material"
import BaseDialog from "@/components/shared/BaseDialog"

interface ConfirmDialogProps {
  open: boolean
  title: string
  /** Qué va a pasar si confirma; conviene decir también si se puede deshacer. */
  message: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** "error" para acciones que quitan algo; "primary" para el resto. */
  confirmColor?: "primary" | "error" | "warning"
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

/**
 * Confirmación simple antes de una acción que no se puede deshacer o que sale fuera del sistema
 * (por ejemplo, enviar un correo). Se apoya en BaseDialog.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  confirmColor = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <BaseDialog
      open={open}
      onClose={loading ? undefined : onCancel}
      title={title}
      maxWidth="xs"
      fullWidth
      actions={[
        { label: cancelLabel, onClick: onCancel, variant: "text", color: "inherit", disabled: loading },
        { label: confirmLabel, onClick: onConfirm, variant: "contained", color: confirmColor, loading },
      ]}
    >
      <Typography variant="body2" component="div">
        {message}
      </Typography>
    </BaseDialog>
  )
}
