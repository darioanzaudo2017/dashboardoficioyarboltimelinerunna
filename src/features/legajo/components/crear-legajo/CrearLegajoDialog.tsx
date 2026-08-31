'use client'

/**
 * Main Dialog for Legajo Creation (LEG-02)
 * Multi-step wizard for creating legajo (manual)
 */

import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel, IconButton, Box, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import BusquedaNnyaStep from './BusquedaNnyaStep'
import DatosNnyaStep from './DatosNnyaStep'
import AsignacionStep from './AsignacionStep'
import ResumenStep from './ResumenStep'
import { useCreateLegajo } from '../../hooks/useCreateLegajo'
import type {
  CreateLegajoManualRequest,
  BusquedaNnyaResult,
  NnyaCreateData,
} from '../../types/legajo-creation.types'

interface Props {
  open: boolean
  onClose: () => void
}

const steps = ['Buscar NNyA', 'Datos Personales', 'Asignación', 'Confirmar']

export default function CrearLegajoDialog({ open, onClose }: Props) {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<Partial<CreateLegajoManualRequest>>({})
  const [nnyaSeleccionado, setNnyaSeleccionado] = useState<BusquedaNnyaResult | null>(null)
  const [modoCreacion, setModoCreacion] = useState<'existente' | 'nuevo'>('nuevo')

  const { mutateAsync: crearLegajo, isPending } = useCreateLegajo()

  const handleNext = () => setActiveStep((prev) => prev + 1)
  const handleBack = () => setActiveStep((prev) => prev - 1)

  const resetForm = () => {
    setActiveStep(0)
    setFormData({})
    setNnyaSeleccionado(null)
    setModoCreacion('nuevo')
  }

  // Step 1: NNyA Selection
  const handleNnyaSelect = (nnya: BusquedaNnyaResult) => {
    setNnyaSeleccionado(nnya)
    setModoCreacion('existente')
    setFormData((current) => ({ ...current, nnya: nnya.id, nnya_data: undefined }))
    handleNext()
  }

  const handleCrearNuevo = () => {
    setNnyaSeleccionado(null)
    setModoCreacion('nuevo')
    handleNext()
  }

  // Step 2: NNyA Data
  const handleDatosNnyaComplete = (datosNnya: NnyaCreateData) => {
    if (modoCreacion === 'nuevo') {
      setFormData((current) => ({ ...current, nnya: undefined, nnya_data: datosNnya }))
    }
    handleNext()
  }

  // Step 3: Assignment
  const handleAsignacionComplete = (asignacion: Partial<CreateLegajoManualRequest>) => {
    setFormData((current) => ({ ...current, ...asignacion }))
    handleNext()
  }

  // Step 4: Confirm and Create
  const handleConfirmar = async () => {
    try {
      await crearLegajo(formData as CreateLegajoManualRequest)

      // Close dialog and reset
      handleDialogClose()
    } catch (error) {
      console.error('Error al crear legajo:', error)
      // Error handling done in mutation hook
    }
  }

  const handleDialogClose = () => {
    if (!isPending) {
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isPending}
      TransitionProps={{ onExited: resetForm }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
              Crear Nuevo Legajo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete el formulario con la información requerida. Los campos marcados con * son obligatorios.
            </Typography>
          </Box>
          <IconButton
            onClick={handleDialogClose}
            disabled={isPending}
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        {activeStep === 0 && (
          <BusquedaNnyaStep onSelect={handleNnyaSelect} onCrearNuevo={handleCrearNuevo} />
        )}

        {activeStep === 1 && (
          <DatosNnyaStep
            nnyaSeleccionado={nnyaSeleccionado}
            modoCreacion={modoCreacion}
            onComplete={handleDatosNnyaComplete}
            onBack={handleBack}
          />
        )}

        {activeStep === 2 && (
          <AsignacionStep formData={formData} onComplete={handleAsignacionComplete} onBack={handleBack} />
        )}

        {activeStep === 3 && (
          <ResumenStep
            formData={formData}
            nnyaSeleccionado={nnyaSeleccionado}
            onConfirmar={handleConfirmar}
            onBack={handleBack}
            isSubmitting={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
