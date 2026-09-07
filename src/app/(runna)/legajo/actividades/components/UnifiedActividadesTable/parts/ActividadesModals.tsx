"use client"

import { ActividadDetailModal } from "../../../../[id]/medida/[medidaId]/components/medida/ActividadDetailModal"
import { EditActividadModal } from "../../../../[id]/medida/[medidaId]/components/medida/EditActividadModal"
import { CancelActividadModal } from "../../../../[id]/medida/[medidaId]/components/medida/CancelActividadModal"
import AsignarActividadModal from "../../../../[id]/medida/[medidaId]/components/medida/AsignarActividadModal"
import { PlanAccionModal } from "../../../../[id]/medida/[medidaId]/components/medida/plan-accion-modal"
import BulkAsignarActividadModal from "../../BulkAsignarActividadModal"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"
import type { ActividadModals } from "../hooks/useActividadModals"
import type { ActividadFeatures } from "../features"

interface ActividadesModalsProps {
  modals: ActividadModals
  features: ActividadFeatures
  medidaData: any
  planTrabajoId: number | undefined
  filterEtapa: "APERTURA" | "PROCESO" | "CESE" | undefined
  selectedActividades: TActividadPlanTrabajo[]
  handleModalSuccess: () => void
  handleBulkSuccess: (updatedActividades?: TActividadPlanTrabajo[]) => void
}

/** Modales de detalle, edición, cancelación y asignación (individual y en lote). */
export const ActividadesModals = ({
  modals,
  features,
  medidaData,
  planTrabajoId,
  filterEtapa,
  selectedActividades,
  handleModalSuccess,
  handleBulkSuccess,
}: ActividadesModalsProps) => {
  const {
    detailModalOpen,
    setDetailModalOpen,
    editModalOpen,
    setEditModalOpen,
    cancelModalOpen,
    setCancelModalOpen,
    asignarModalOpen,
    setAsignarModalOpen,
    bulkModalOpen,
    setBulkModalOpen,
    planAccionModalOpen,
    setPlanAccionModalOpen,
    selectedActividad,
    setSelectedActividad,
  } = modals

  return (
    <>
      {/* Activity Detail Modal */}
      {selectedActividad && (
        <ActividadDetailModal
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false)
            setSelectedActividad(null)
          }}
          actividad={selectedActividad}
          onUpdate={handleModalSuccess}
        />
      )}

      {/* Edit Modal (medida variant) */}
      {features.showEdit && selectedActividad && (
        <EditActividadModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedActividad(null)
          }}
          actividad={selectedActividad}
          tipoMedida={medidaData?.tipo_medida}
          onSuccess={handleModalSuccess}
          legajoPrimario={
            medidaData?.legajo
              ? {
                  id: medidaData.legajo.id,
                  numero: medidaData.legajo.numero,
                  nnya: {
                    nombre: medidaData.legajo.nnya?.nombre ?? "",
                    apellido: medidaData.legajo.nnya?.apellido ?? "",
                  },
                }
              : undefined
          }
          legajosAdicionales={medidaData?.legajos_adicionales ?? []}
        />
      )}

      {/* Cancel Modal (medida variant) */}
      {features.showCancel && selectedActividad && (
        <CancelActividadModal
          open={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false)
            setSelectedActividad(null)
          }}
          actividadId={selectedActividad.id}
          actividadNombre={`${selectedActividad.tipo_actividad_info?.nombre || ""} - ${selectedActividad.subactividad || ""}`}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Individual Assign Modal (medida variant) */}
      {features.showIndividualAssign && selectedActividad && (
        <AsignarActividadModal
          open={asignarModalOpen}
          onClose={() => {
            setAsignarModalOpen(false)
            setSelectedActividad(null)
          }}
          actividadId={selectedActividad.id}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Bulk Assign Modal */}
      {features.showBulkAssign && (
        <BulkAsignarActividadModal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          selectedActividades={selectedActividades}
          onSuccess={handleBulkSuccess}
        />
      )}

      {/* Plan Accion Modal (medida variant) */}
      {features.showAddActivity && planTrabajoId && (
        <PlanAccionModal
          open={planAccionModalOpen}
          onClose={() => setPlanAccionModalOpen(false)}
          planTrabajoId={planTrabajoId}
          onSuccess={handleModalSuccess}
          tipoMedida={medidaData?.tipo_medida}
          filterEtapa={filterEtapa}
          legajoPrimario={
            medidaData?.legajo
              ? {
                  id: medidaData.legajo.id,
                  numero: medidaData.legajo.numero,
                  nnya: {
                    nombre: medidaData.legajo.nnya?.nombre ?? "",
                    apellido: medidaData.legajo.nnya?.apellido ?? "",
                  },
                }
              : undefined
          }
          legajosAdicionales={medidaData?.legajos_adicionales ?? []}
        />
      )}
    </>
  )
}
