"use client"

/**
 * Tarjeta de un Informe Mensual de Seguimiento (PLTM-03) para el módulo
 * "Informes Mensuales" del árbol de la medida.
 */
import type React from "react"
import AssessmentIcon from "@mui/icons-material/Assessment"
import { getAdjuntos } from "../../../api/informe-seguimiento-api-service"
import type { InformeSeguimientoListItem } from "../../../types/informe-seguimiento-api"
import { DocCardShell, AdjuntosLazySection } from "./documento-cards"

export const InformeMensualCard: React.FC<{ medidaId: number; informe: InformeSeguimientoListItem }> = ({
  medidaId,
  informe,
}) => (
  <DocCardShell
    icon={<AssessmentIcon fontSize="small" />}
    iconColor="warning.main"
    titulo={`Informe mensual N.º ${informe.numero_informe}`}
    estadoLabel={informe.estado_display ?? informe.estado}
    fecha={informe.fecha_completado ?? informe.fecha_vencimiento}
    usuario={informe.entrega_tardia ? "Entrega tardía" : undefined}
  >
    {(informe.adjuntos_count ?? 0) > 0 && (
      <AdjuntosLazySection
        queryKey={["arbol-adjuntos-informe-mensual", medidaId, informe.id]}
        queryFn={async () => {
          const adjuntos = await getAdjuntos(medidaId, informe.id)
          return adjuntos.map((a) => ({ id: a.id, nombre: a.nombre_original, href: a.archivo }))
        }}
      />
    )}
  </DocCardShell>
)
