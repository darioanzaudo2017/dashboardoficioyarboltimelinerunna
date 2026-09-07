"use client"

import { useCallback, useMemo } from "react"
import type { FileItem } from "../../file-upload-section"
import type { RegistroIntervencion } from "../types"

interface UseIntervencionFilesParams {
    adjuntos: RegistroIntervencion["adjuntos"]
    uploadAdjuntoFile: RegistroIntervencion["uploadAdjuntoFile"]
    deleteAdjuntoFile: RegistroIntervencion["deleteAdjuntoFile"]
    setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>
    setPendingFileTipos: React.Dispatch<React.SetStateAction<string[]>>
}

/**
 * Manejo de adjuntos del modal: subida, cola de pendientes, descarga y mapeo.
 * Mantiene el orden original de useCallback/useMemo.
 */
export function useIntervencionFiles({
    adjuntos,
    uploadAdjuntoFile,
    deleteAdjuntoFile,
    setPendingFiles,
    setPendingFileTipos,
}: UseIntervencionFilesParams) {
    // ============================================================================
    // HANDLERS - File Management
    // ============================================================================

    /**
     * Handle file upload for existing intervention
     */
    const handleFileUpload = useCallback(async (file: File) => {
        await uploadAdjuntoFile(file, 'RESPALDO')
    }, [uploadAdjuntoFile])

    /**
     * Handle adding files to pending queue (before intervention exists)
     */
    const handleAddPendingFile = useCallback((file: File, tipo: string = 'RESPALDO') => {
        setPendingFiles(prev => [...prev, file])
        setPendingFileTipos(prev => [...prev, tipo])
    }, [])

    /**
     * Handle removing file from pending queue
     */
    const handleRemovePendingFile = useCallback((index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index))
        setPendingFileTipos(prev => prev.filter((_, i) => i !== index))
    }, [])

    const handleDeleteAdjunto = useCallback((fileId: number | string) => {
        deleteAdjuntoFile(Number(fileId))
    }, [deleteAdjuntoFile])

    const handleDownloadFile = useCallback((file: FileItem) => {
        if (file.url) {
            // Use the same base URL approach as axiosInstance
            // NEXT_PUBLIC_API_URL is like: http://localhost:8000/api or https://...railway.app/api
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-runna-v2legajos.up.railway.app/api'

            // Extract base origin (remove /api suffix if present)
            const baseOrigin = apiUrl.replace(/\/api\/?$/, '')

            // Construct full URL
            const downloadUrl = file.url.startsWith('http://') || file.url.startsWith('https://')
                ? file.url
                : `${baseOrigin}${file.url}`

            // Open in new tab to trigger download
            window.open(downloadUrl, '_blank')
        }
    }, [])

    // Map adjuntos to FileItem format (memoized to prevent unnecessary re-renders)
    const mappedAdjuntos: FileItem[] = useMemo(() => adjuntos.map(adj => ({
        id: adj.id,
        nombre: adj.nombre_original,
        tipo: adj.tipo, // Use raw tipo for filtering
        tipo_display: adj.tipo_display || (adj.tipo === 'INFORME' ? 'Informe Obligatorio' : adj.tipo),
        url: adj.url_descarga || adj.archivo,
        fecha_subida: adj.fecha_subida,
        tamano: adj.tamaño_bytes,
    })), [adjuntos])

    // Filtered list for "Additional Documents" section (excludes mandatory report)
    const additionalMappedAdjuntos = useMemo(() =>
        mappedAdjuntos.filter(adj => adj.tipo !== 'INFORME')
        , [mappedAdjuntos])

    return {
        handleFileUpload,
        handleAddPendingFile,
        handleRemovePendingFile,
        handleDeleteAdjunto,
        handleDownloadFile,
        mappedAdjuntos,
        additionalMappedAdjuntos,
    }
}

export type IntervencionFiles = ReturnType<typeof useIntervencionFiles>
