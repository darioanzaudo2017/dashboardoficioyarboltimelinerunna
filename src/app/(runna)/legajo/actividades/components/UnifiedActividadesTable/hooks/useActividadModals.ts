"use client"

import { useState } from "react"
import type { TActividadPlanTrabajo } from "../../../../[id]/medida/[medidaId]/types/actividades"

/** Estado de apertura de los modales y la actividad sobre la que operan. */
export const useActividadModals = () => {
  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [asignarModalOpen, setAsignarModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [planAccionModalOpen, setPlanAccionModalOpen] = useState(false)
  const [selectedActividad, setSelectedActividad] = useState<TActividadPlanTrabajo | null>(null)

  // Acuse de Recibo / Lectura Multi-Usuario
  const [pendingAcuseActividad, setPendingAcuseActividad] = useState<TActividadPlanTrabajo | null>(null)

  return {
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
    pendingAcuseActividad,
    setPendingAcuseActividad,
  }
}

export type ActividadModals = ReturnType<typeof useActividadModals>
