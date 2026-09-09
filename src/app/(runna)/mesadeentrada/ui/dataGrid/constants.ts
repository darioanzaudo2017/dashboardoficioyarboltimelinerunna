import type { GridColumnVisibilityModel } from "@mui/x-data-grid"
import type { PresetKey } from "./types"

// Visibility presets for the demandas grid. Keys must match column `field` names.
// `undefined`/missing keys default to visible; explicit `false` hides the column.
// Las columnas de identificacion (apellido, nombre, dni) no se listan a proposito:
// tienen que quedar visibles en todos los presets.
export const VISIBILITY_STORAGE_KEY = "mesadeentrada:columnVisibility:v1"
export const PRESET_STORAGE_KEY = "mesadeentrada:activePreset:v1"


export const PRESETS: Record<PresetKey, { label: string; visibility: GridColumnVisibilityModel }> = {
  pendientes: {
    label: "Pendientes",
    visibility: {
      id: false,
      origen: false,
      localidad: false,
      zonaEquipo: false,
      objetivoDemanda: false,
      adjuntos: false,
    },
  },
  sin_asignar: {
    label: "Sin asignar",
    visibility: {
      id: false,
      origen: false,
      envioRespuesta: false,
      objetivoDemanda: false,
      adjuntos: false,
    },
  },
  con_alertas: {
    label: "Con alertas",
    visibility: {
      origen: false,
      localidad: false,
      envioRespuesta: false,
      objetivoDemanda: false,
    },
  },
  completa: {
    label: "Vista completa",
    visibility: {},
  },
}

export const VIEW_MODE_STORAGE_KEY = "mesadeentrada:viewMode:v1"
