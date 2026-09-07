"use client"

import { useCallback } from "react"
import type { RegistroIntervencion } from "../types"

interface UseInformeObligatorioParams {
    canEdit: RegistroIntervencion["canEdit"]
    informeObligatorioInputRef: React.RefObject<HTMLInputElement>
    setInformeObligatorio: React.Dispatch<React.SetStateAction<File | null>>
    setInformeObligatorioError: React.Dispatch<React.SetStateAction<string | null>>
    setIsDraggingInformeObligatorio: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Manejo del Informe Obligatorio (documento PDF requerido).
 * Mantiene el orden original de los useCallback.
 */
export function useInformeObligatorio({
    canEdit,
    informeObligatorioInputRef,
    setInformeObligatorio,
    setInformeObligatorioError,
    setIsDraggingInformeObligatorio,
}: UseInformeObligatorioParams) {
    // ============================================================================
    // HANDLERS - Informe Obligatorio (Mandatory Document)
    // ============================================================================

    /**
     * Format file size for display
     */
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }, [])

    /**
     * Validate PDF file
     */
    const validatePdfFile = useCallback((file: File): string | null => {
        if (file.type !== 'application/pdf') {
            return `"${file.name}" no es un archivo PDF`
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
            return `"${file.name}" excede el tamaño máximo de 10MB`
        }
        return null
    }, [])

    /**
     * Handle template download
     */
    const handleDownloadTemplate = useCallback(() => {
        const link = document.createElement('a')
        link.href = '/templates/informe-obligatorio-template.pdf'
        link.download = 'plantilla-informe-obligatorio.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [])

    /**
     * Handle informe obligatorio file selection
     */
    const handleInformeObligatorioSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const error = validatePdfFile(file)
        if (error) {
            setInformeObligatorioError(error)
            return
        }

        setInformeObligatorio(file)
        setInformeObligatorioError(null)

        if (informeObligatorioInputRef.current) {
            informeObligatorioInputRef.current.value = ''
        }
    }, [validatePdfFile])

    /**
     * Handle removing informe obligatorio
     */
    const handleRemoveInformeObligatorio = useCallback(() => {
        setInformeObligatorio(null)
        setInformeObligatorioError(null)
    }, [])

    /**
     * Drag-drop handlers for informe obligatorio
     */
    const handleInformeObligatorioDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (canEdit) {
            setIsDraggingInformeObligatorio(true)
        }
    }, [canEdit])

    const handleInformeObligatorioDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingInformeObligatorio(false)
    }, [])

    const handleInformeObligatorioDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleInformeObligatorioDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingInformeObligatorio(false)

        if (!canEdit) return

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            const file = files[0]
            const error = validatePdfFile(file)
            if (error) {
                setInformeObligatorioError(error)
                return
            }
            setInformeObligatorio(file)
            setInformeObligatorioError(null)
        }
    }, [canEdit, validatePdfFile])

    return {
        formatFileSize,
        validatePdfFile,
        handleDownloadTemplate,
        handleInformeObligatorioSelect,
        handleRemoveInformeObligatorio,
        handleInformeObligatorioDragEnter,
        handleInformeObligatorioDragLeave,
        handleInformeObligatorioDragOver,
        handleInformeObligatorioDrop,
    }
}

export type InformeObligatorioHandlers = ReturnType<typeof useInformeObligatorio>
