import React from "react"
import { Box, Typography } from "@mui/material"
import type { EtapaDetailResponse } from "../../../../api/etapa-detail-api-service"

type EtapaHistorial = NonNullable<EtapaDetailResponse["etapas_mismo_tipo"]>[number]

interface EtapaHistorialSelectorProps {
  tipoEtapaLabelForBanner: string
  etapasHistorial: EtapaHistorial[]
  selectedEtapaId: number | null
  etapaDetail: EtapaDetailResponse | null
  legajosAdicionalesForDialog: any[]
  setSelectedEtapaId: (v: number | null) => void
}

/**
 * Selector GAP-08 del historial de etapas del mismo tipo.
 * `formatEtapaLabel` y el bloque de render se movieron tal cual desde
 * `unified-workflow-tab.tsx` (líneas 860-883 y 889-932).
 */
export const EtapaHistorialSelector = ({
  tipoEtapaLabelForBanner,
  etapasHistorial,
  selectedEtapaId,
  etapaDetail,
  legajosAdicionalesForDialog,
  setSelectedEtapaId,
}: EtapaHistorialSelectorProps) => {
  const formatEtapaLabel = (e: typeof etapasHistorial[number], index: number) => {
    // index 0 = most recent, etc. We label as "#N" with N counted oldest-first
    // for human readability.
    const total = etapasHistorial.length
    const ordinal = total - index
    const fechaInicio = e.fecha_inicio
      ? new Date(e.fecha_inicio).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "sin fecha"
    const estadoLabel = e.estado_nombre ?? (e.activa ? "activa" : "cerrada")
    const suffix = e.activa ? " · activa" : " · cerrada"
    // Granularidad: si tenemos el scope para esta etapa, lo incluimos en el label.
    const eAny = e as any
    let scopeLabel = ""
    if (legajosAdicionalesForDialog.length > 0) {
      const scopeIds: number[] = Array.isArray(eAny.legajos_alcance) ? eAny.legajos_alcance : []
      const totalLegajos = legajosAdicionalesForDialog.length + 1
      if (eAny.es_grupal === true || scopeIds.length === 0) {
        scopeLabel = ` · grupal (${totalLegajos} NNyAs)`
      } else {
        scopeLabel = ` · específica (${scopeIds.length}/${totalLegajos} NNyAs)`
      }
    }
    return `#${ordinal} · inicio ${fechaInicio} · ${estadoLabel}${suffix}${scopeLabel}`
  }

  return (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Historial de {tipoEtapaLabelForBanner}:
          </Typography>
          <Box
            component="select"
            value={(selectedEtapaId ?? etapaDetail?.etapa.id ?? "").toString()}
            onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => {
              const v = ev.target.value
              setSelectedEtapaId(v ? Number(v) : null)
            }}
            sx={{
              minWidth: 280,
              padding: "6px 10px",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              fontSize: "0.875rem",
              fontFamily: "inherit",
            }}
          >
            {etapasHistorial.map((e, index) => (
              <option key={e.id} value={e.id}>
                {formatEtapaLabel(e, index)}
              </option>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {etapasHistorial.length} etapas registradas. Cada una tiene sus propios documentos.
          </Typography>
        </Box>
  )
}
