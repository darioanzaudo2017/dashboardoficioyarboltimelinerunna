"use client"

/**
 * WizardModal - Reusable Multi-Step Wizard Component
 *
 * Provides stepper UI and navigation for multi-step forms.
 * Extracted from RegistroIntervencionModal for reusability.
 *
 * Features:
 * - Visual stepper with progress indicator
 * - Step navigation (next, back, direct step click)
 * - Responsive layout
 * - Customizable step labels
 * - Action buttons (primary and secondary)
 */

import React, { Component, type ErrorInfo } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"

export interface WizardStep {
  label: string
  content: React.ReactNode
  optional?: boolean
}

export interface WizardModalProps {
  open: boolean
  onClose: () => void
  title: string
  steps: WizardStep[]
  activeStep: number
  onNext?: () => void
  onBack?: () => void
  onStepClick?: (step: number) => void
  primaryAction?: {
    label: string
    onClick: () => void | Promise<void>
    disabled?: boolean
    loading?: boolean
    icon?: React.ReactNode
  }
  secondaryActions?: Array<{
    label: string
    onClick: () => void | Promise<void>
    disabled?: boolean
    loading?: boolean
    icon?: React.ReactNode
    variant?: "text" | "outlined" | "contained"
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success"
  }>
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl"
  fullWidth?: boolean
  showProgress?: boolean
  allowStepClick?: boolean
}

interface WizardContentBoundaryProps {
  children: React.ReactNode
  resetKey: number
}

interface WizardContentBoundaryState {
  hasError: boolean
}

/**
 * Evita que un error aislado en el contenido de un paso derribe toda la ruta.
 * El detalle queda en consola para diagnóstico y el usuario conserva el modal.
 */
class WizardContentBoundary extends Component<
  WizardContentBoundaryProps,
  WizardContentBoundaryState
> {
  state: WizardContentBoundaryState = { hasError: false }

  static getDerivedStateFromError(): WizardContentBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error al renderizar un paso del asistente:", error, info)
  }

  componentDidUpdate(previousProps: WizardContentBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error">
          <AlertTitle>No se pudo mostrar este paso</AlertTitle>
          Volvé al paso anterior y revisá los datos. La información cargada no se perdió.
        </Alert>
      )
    }
    return this.props.children
  }
}

export const WizardModal: React.FC<WizardModalProps> = ({
  open,
  onClose,
  title,
  steps,
  activeStep,
  onNext,
  onBack,
  onStepClick,
  primaryAction,
  secondaryActions = [],
  maxWidth = "lg",
  fullWidth = true,
  showProgress = true,
  allowStepClick = true,
}) => {
  const lastStepIndex = Math.max(steps.length - 1, 0)
  const safeActiveStep = Math.min(Math.max(activeStep, 0), lastStepIndex)
  const progress = steps.length > 0 ? ((safeActiveStep + 1) / steps.length) * 100 : 0
  const isFirstStep = safeActiveStep === 0
  const isLastStep = safeActiveStep === lastStepIndex

  const handleStepClick = (step: number) => {
    if (allowStepClick && onStepClick) {
      onStepClick(step)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          maxHeight: "96vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Progress Bar */}
      {showProgress && (
        <Box sx={{ px: 3 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Paso {safeActiveStep + 1} de {steps.length}
          </Typography>
        </Box>
      )}

      {/* Stepper */}
      <Box sx={{ px: 2.5, py: 1 }}>
        <Stepper activeStep={safeActiveStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label} completed={index < safeActiveStep}>
              <StepLabel
                optional={step.optional ? <Typography variant="caption">Opcional</Typography> : undefined}
                sx={{
                  cursor: allowStepClick ? "pointer" : "default",
                  "& .MuiStepLabel-label": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  },
                }}
                onClick={() => handleStepClick(index)}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 2.5, py: 1.5, overflowY: "auto" }}>
        <WizardContentBoundary resetKey={safeActiveStep}>
          {steps[safeActiveStep]?.content ?? (
            <Alert severity="warning">No hay contenido configurado para este paso.</Alert>
          )}
        </WizardContentBoundary>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 2.5, py: 1, gap: 1, flexWrap: "wrap", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Back Button */}
          {!isFirstStep && onBack && (
            <Button
              onClick={onBack}
              startIcon={<NavigateBeforeIcon />}
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Anterior
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {/* Secondary Actions */}
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              variant={action.variant || "outlined"}
              color={action.color || "primary"}
              startIcon={action.icon}
              sx={{ textTransform: "none" }}
            >
              {action.label}
            </Button>
          ))}

          {/* Next Button - Only show if no primaryAction is provided */}
          {!isLastStep && onNext && !primaryAction && (
            <Button
              onClick={onNext}
              endIcon={<NavigateNextIcon />}
              variant="contained"
              sx={{ textTransform: "none" }}
            >
              Siguiente
            </Button>
          )}

          {/* Primary Action (can be used for any step, including "Siguiente") */}
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              variant="contained"
              color="primary"
              startIcon={primaryAction.loading ? undefined : primaryAction.icon}
              sx={{ textTransform: "none" }}
            >
              {primaryAction.loading ? "Procesando..." : primaryAction.label}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}
