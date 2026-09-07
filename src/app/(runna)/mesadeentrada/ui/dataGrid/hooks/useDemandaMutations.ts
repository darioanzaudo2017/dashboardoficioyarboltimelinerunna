"use client"

import { useMutation } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import type { GridPaginationModel } from "@mui/x-data-grid"
import { toast } from "react-toastify"
import { update, create, put } from "@/app/api/apiService"
import type { TDemanda, TCalificacionOperation, TDemandaZonaOperation } from "@/app/interfaces"
import type { TDemandaPaginated } from "../types"

interface UseDemandaMutationsOptions {
  demandasData: TDemandaPaginated | null
  setDemandasData: React.Dispatch<React.SetStateAction<TDemandaPaginated | null>>
  queryClient: QueryClient
  paginationModel: GridPaginationModel
  /** Se invoca tras marcar la demanda como recibida, con el id de la demanda. */
  handleOpenModal: (demandaId: number) => void
}

/**
 * Mutaciones del grid de demandas: calificación (crear/actualizar) y
 * `demanda-zona-recibir`, con su tolerancia a 208/403/404 y el fallback a `demanda-zona`.
 */
export const useDemandaMutations = ({
  demandasData,
  setDemandasData,
  queryClient,
  paginationModel,
  handleOpenModal,
}: UseDemandaMutationsOptions) => {
  const updateCalificacion = useMutation({
    mutationFn: async ({ demandaId, newValue }: { demandaId: number; newValue: string }) => {
      const demanda = demandasData?.results.find((d) => d.id === demandaId)
      if (!demanda) throw new Error("Demanda not found")

      if (demanda.calificacion) {
        return update<TCalificacionOperation>(
          "calificacion-demanda",
          demanda.calificacion.id,
          {
            estado_calificacion: newValue,
            ultima_actualizacion: new Date().toISOString(),
          },
          true,
          "¡Calificación actualizada con éxito!",
        )
      } else {
        const currentDate = new Date().toISOString()
        return create<TCalificacionOperation>(
          `calificacion-demanda`,
          {
            fecha_y_hora: currentDate,
            descripcion: `Nueva Calificación: ${newValue}`,
            estado_calificacion: newValue,
            demanda: demandaId,
            justificacion: "N/A",
          },
          true,
          "¡Calificación creada con éxito!",
        )
      }
    },
    onSuccess: (data, variables) => {
      console.log("Server response:", data)
      queryClient.invalidateQueries({ queryKey: ["demandas"] })
      queryClient.refetchQueries({ queryKey: ["demandas", paginationModel.page, paginationModel.pageSize] })
    },
    onError: (error) => {
      console.error("Error al actualizar la Calificación:", error)
      toast.error("Error al actualizar la Calificación", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      })
    },
  })

  const updateDemandaZona = useMutation({
    mutationFn: async ({ id, demandaId, userId }: { id: number; demandaId: number; userId: number }) => {
      const currentDate = new Date().toISOString()
      try {
        // Try to use the PUT endpoint first
        const response = await put<TDemandaZonaOperation>(
          "demanda-zona-recibir",
          id,
          {
            fecha_recibido: currentDate,
            recibido: true,
            recibido_por: userId,
          },
          true,
          "Demanda marcada como recibida",
        )

        // If successful, return the response
        return response
      } catch (error: any) {
        // Special handling for 208 status code (Already Reported)
        if (error.response && error.response.status === 208) {
          console.log("La demanda ya estaba marcada como recibida (208). Continuando con visualización.")
          return {
            id,
            demanda: demandaId,
            fecha_recibido: currentDate,
            recibido: true,
            recibido_por: userId,
          }
        }

        // Handle other error status codes
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
          console.warn(`Endpoint demanda-zona-recibir retornó ${error.response.status}. Continuando con visualización.`)

          if (error.response.status === 403) {
            toast.warning("No tienes permisos para marcar como recibida esta demanda, pero puedes ver los detalles.", {
              position: "top-center",
              autoClose: 3000,
            })
            return { id, demanda: demandaId }
          }

          // For 404 errors, try the fallback method
          toast.warning(
            "No se pudo marcar como recibida usando el método principal. Intentando método alternativo...",
            {
              position: "top-center",
              autoClose: 3000,
            },
          )

          // Fallback to the regular update endpoint
          return update<TDemandaZonaOperation>(
            "demanda-zona",
            id,
            {
              fecha_recibido: currentDate,
              recibido: true,
              recibido_por: userId,
            },
            true,
            "Demanda marcada como recibida (método alternativo)",
          )
        }

        // If it's not a handled error status code, rethrow it
        throw error
      }
    },
    onSuccess: (data, variables) => {
      // Only invalidate queries if we actually updated something
      if ('fecha_recibido' in data && data.fecha_recibido) {
        queryClient.invalidateQueries({ queryKey: ["demandas"] })
        // Update the local state to reflect the changes
        setDemandasData((prevData) => {
          if (!prevData) return null
          return {
            ...prevData,
            results: prevData.results.map((demanda) =>
              demanda.demanda_zona_id === data.id
                ? {
                  ...demanda,
                  demanda_zona: {
                    ...demanda.demanda_zona,
                    recibido: true,
                    fecha_recibido: data.fecha_recibido,
                  },
                } as TDemanda
                : demanda,
            ),
          }
        })
      }

      // Open DemandaDetalle modal using the demandaId from variables
      handleOpenModal(variables.demandaId)
    },
    onError: (error) => {
      console.error("Error al actualizar la Demanda Zona:", error)
      toast.error("Error al marcar la demanda como recibida", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      })
    },
  })

  return { updateCalificacion, updateDemandaZona }
}
