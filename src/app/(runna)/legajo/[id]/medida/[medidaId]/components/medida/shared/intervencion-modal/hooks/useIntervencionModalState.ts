"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import type { RegistroIntervencion } from "../types"

interface UseIntervencionModalStateParams {
    open: boolean
    medidaId?: number
    adjuntos: RegistroIntervencion["adjuntos"]
    clearErrors: RegistroIntervencion["clearErrors"]
}

/**
 * Estado local del modal de intervención.
 * Los hooks se declaran en el mismo orden que tenían en el componente original.
 */
export function useIntervencionModalState({ open, medidaId, adjuntos, clearErrors }: UseIntervencionModalStateParams) {
    // ============================================================================
    // LOCAL STATE
    // ============================================================================
    const [activeStep, setActiveStep] = useState(0)
    const [validationError, setValidationError] = useState<string | null>(null)

    // Validate medidaId on mount
    useEffect(() => {
        if (open && !medidaId) {
            setValidationError('Error: medidaId no está definido. No se pueden cargar las intervenciones.')
        } else {
            setValidationError(null)
        }
    }, [open, medidaId])

    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    // Rejection dialog state
    const [rechazarDialogOpen, setRechazarDialogOpen] = useState(false)
    const [observaciones, setObservaciones] = useState("")

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error' | 'info'
    }>({
        open: false,
        message: '',
        severity: 'success'
    })

    // Pending files state (for files selected before intervention is created)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [pendingFileTipos, setPendingFileTipos] = useState<string[]>([])

    // Mandatory document state (Informe Obligatorio)
    const [informeObligatorio, setInformeObligatorio] = useState<File | null>(null)
    const [informeObligatorioError, setInformeObligatorioError] = useState<string | null>(null)
    const [isDraggingInformeObligatorio, setIsDraggingInformeObligatorio] = useState(false)
    const informeObligatorioInputRef = useRef<HTMLInputElement>(null)

    // NEW: Check if there's already an "Informe Obligatorio" in the existing attachments
    const hasExistingInforme = useMemo(() => {
        return adjuntos.some(adj => adj.tipo === 'INFORME')
    }, [adjuntos])

    const existingInformeName = useMemo(() => {
        const informe = adjuntos.find(adj => adj.tipo === 'INFORME')
        return informe ? informe.nombre_original : null
    }, [adjuntos])

    // ============================================================================
    // EFFECTS
    // ============================================================================
    useEffect(() => {
        if (open) {
            clearErrors()
            setActiveStep(0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    return {
        activeStep,
        setActiveStep,
        validationError,
        setValidationError,
        showSuccessMessage,
        setShowSuccessMessage,
        rechazarDialogOpen,
        setRechazarDialogOpen,
        observaciones,
        setObservaciones,
        snackbar,
        setSnackbar,
        pendingFiles,
        setPendingFiles,
        pendingFileTipos,
        setPendingFileTipos,
        informeObligatorio,
        setInformeObligatorio,
        informeObligatorioError,
        setInformeObligatorioError,
        isDraggingInformeObligatorio,
        setIsDraggingInformeObligatorio,
        informeObligatorioInputRef,
        hasExistingInforme,
        existingInformeName,
    }
}

export type IntervencionModalState = ReturnType<typeof useIntervencionModalState>
