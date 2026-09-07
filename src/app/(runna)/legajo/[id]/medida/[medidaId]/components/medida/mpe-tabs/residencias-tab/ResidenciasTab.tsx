"use client"

import type React from "react"
import { Box, Paper, Button } from "@mui/material"
import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { InformacionEducativaSection } from "../../shared/InformacionEducativaSection"
import { InformacionSaludSection } from "../../shared/InformacionSaludSection"
import { TalleresSection } from "../../shared/TalleresSection"
import {
    mapEducacionFromDemanda,
    mapSaludFromDemandaEnhanced,
} from "../../../../utils/seguimiento-mapper"
import { CambioLugarResguardoSection } from "./sections/CambioLugarResguardoSection"
import { SituacionResidenciaSection } from "./sections/SituacionResidenciaSection"
import { NotasSeguimientoSection } from "./sections/NotasSeguimientoSection"
import type { ResidenciasTabProps } from "./types"

export const ResidenciasTab: React.FC<ResidenciasTabProps> = ({
    medidaId,
    demandaData,
    personaId
}) => {
    const [selectedSection, setSelectedSection] = useState<string>("situacion-residencia")

    // Óptica de legajo: la medida siempre se ve bajo /legajo/[id]/medida/[medidaId],
    // así que el legajo de la ruta ES el NNyA cuyo seguimiento se ve/edita. No hay
    // selector: para ver a otro hermano se navega a su legajo (igual que etapas y
    // actividades). Dirige lectura (?legajo_id=) y escritura (campo legajo).
    const routeParams = useParams()
    const effectiveLegajoId = (() => {
        const raw = Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id
        const n = raw != null ? Number(raw) : NaN
        return Number.isNaN(n) ? undefined : n
    })()

    // Transform demanda data to seguimiento format
    const educacionData = useMemo(() => {
        if (!demandaData) return undefined
        return mapEducacionFromDemanda(demandaData, personaId)
    }, [demandaData, personaId])

    const saludData = useMemo(() => {
        if (!demandaData) return undefined
        return mapSaludFromDemandaEnhanced(demandaData, personaId)
    }, [demandaData, personaId])

    const sidebarOptions = [
        { id: "situacion-residencia", label: "Situación del NNyA en Residencia" },
        { id: "informacion-educativa", label: "Información Educativa" },
        { id: "informacion-salud", label: "Información de Salud" },
        { id: "talleres", label: "Talleres Recreativos y Sociolaborales" },
        { id: "cambio-lugar", label: "Cambio de Lugar de Resguardo" },
        { id: "notas-seguimiento", label: "Notas de Seguimiento" }
    ]

    const renderContent = () => {
        // key con legajoId fuerza remount al cambiar de NNyA, evitando fugas de estado
        const remountKey = `${medidaId}-${effectiveLegajoId ?? "single"}`
        switch (selectedSection) {
            case "situacion-residencia":
                return <SituacionResidenciaSection key={remountKey} medidaId={medidaId} legajoId={effectiveLegajoId} />
            case "informacion-educativa":
                return <InformacionEducativaSection key={remountKey} medidaId={medidaId} legajoId={effectiveLegajoId} personaId={personaId} data={educacionData} />
            case "informacion-salud":
                return <InformacionSaludSection key={remountKey} medidaId={medidaId} legajoId={effectiveLegajoId} personaId={personaId} data={saludData} />
            case "talleres":
                return <TalleresSection key={remountKey} medidaId={medidaId} legajoId={effectiveLegajoId} maxTalleres={5} />
            case "cambio-lugar":
                return <CambioLugarResguardoSection key={remountKey} medidaId={medidaId} legajoId={effectiveLegajoId} />
            case "notas-seguimiento":
                return <NotasSeguimientoSection key={remountKey} medidaId={medidaId} legajoId={effectiveLegajoId} />
            default:
                return <SituacionResidenciaSection key={remountKey} medidaId={medidaId} legajoId={effectiveLegajoId} />
        }
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", gap: 3 }}>
                {/* Sidebar */}
                <Box sx={{ width: 280, flexShrink: 0 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {sidebarOptions.map((option) => (
                            <Button
                                key={option.id}
                                variant={selectedSection === option.id ? "contained" : "outlined"}
                                color="primary"
                                onClick={() => setSelectedSection(option.id)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    justifyContent: "flex-start",
                                    py: 1.5,
                                    px: 2,
                                    fontWeight: selectedSection === option.id ? 600 : 400,
                                }}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </Box>
                </Box>

                {/* Main content */}
                <Box sx={{ flex: 1 }}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, minHeight: 400 }}>
                        {renderContent()}
                    </Paper>
                </Box>
            </Box>
        </Box>
    )
}
