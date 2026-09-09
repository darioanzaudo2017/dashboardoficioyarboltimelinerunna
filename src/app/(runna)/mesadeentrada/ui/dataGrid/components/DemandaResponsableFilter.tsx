"use client"

import { Autocomplete, Button, TextField } from "@mui/material"
import { AssignmentIndRounded, CloseRounded } from "@mui/icons-material"
import { useCatalogData, extractArray } from "@/hooks/useApiQuery"
import { getUserDisplayName } from "@/app/(runna)/legajo/actividades/components/AdvancedFiltersPanel/utils"
import type { Usuario } from "@/app/(runna)/legajo-mesa/types/asignacion-types"
import { institutionalColors, rgba } from "@/theme/colors"

interface DemandaResponsableFilterProps {
  /** `mis_demandas=true` activo. */
  misDemandas: boolean
  /** `responsable=<user_id>` activo, o null. */
  responsable: number | null
  /** Solo jefes zonales, directores y admins eligen a otra persona. */
  canFilterByResponsable: boolean
  onChange: (next: { mis_demandas: boolean; responsable: number | null }) => void
}

/**
 * Filtro por responsable de la bandeja.
 *
 * Va en la barra de acciones, pegado a "Filtros", y no adentro del popover de
 * "Filtros": "Mis demandas" es el filtro que mas se usa -un tecnico entra a la
 * mesa para ver lo suyo- y esconderlo detras de un menu le agregaria dos clics
 * al caso mas frecuente. Tampoco va en la barra de "Vistas:", que solo se
 * renderiza cuando esta la tabla a la vista (`showTable`) y desaparece en mobile
 * y con una demanda abierta, justo donde el filtro tiene que seguir estando.
 *
 * Los dos controles son excluyentes por diseño (ver `handleResponsableFilterChange`):
 * elegir a alguien apaga "Mis demandas" y viceversa, asi la bandeja siempre
 * responde a un unico criterio legible.
 */
export const DemandaResponsableFilter = ({
  misDemandas,
  responsable,
  canFilterByResponsable,
  onChange,
}: DemandaResponsableFilterProps) => {
  // `is_active=true` deja fuera a los usuarios dados de baja, y `page_size=500`
  // evita que la paginacion por defecto de DRF corte la lista en silencio.
  // `useCatalogData` cachea 10 min y comparte la respuesta con el resto de la app.
  const { data: usuariosData, isLoading: isLoadingUsuarios } = useCatalogData<Usuario[]>(
    "users/?is_active=true&page_size=500",
    { enabled: canFilterByResponsable },
  )
  const usuarios = extractArray(usuariosData)

  // Fragment y no un Box contenedor: asi los dos controles son items directos de
  // la barra de acciones y heredan su `gap` y su `flexWrap`, en vez de inventar
  // un espaciado propio que se desalinearia del resto de los botones.
  return (
    <>
      {/* Prioridad 1: un solo clic para ver lo propio. Es un toggle -el mismo
          boton que lo enciende lo apaga-. Activo se pinta contenido y suma una
          X, para que se lea de un vistazo que la bandeja esta recortada y como
          volver a verla entera; `aria-pressed` transmite lo mismo a lectores de
          pantalla. */}
      <Button
        size="small"
        onClick={() => onChange({ mis_demandas: !misDemandas, responsable: null })}
        aria-pressed={misDemandas}
        startIcon={<AssignmentIndRounded />}
        endIcon={misDemandas ? <CloseRounded /> : undefined}
        title={
          misDemandas
            ? "Quitar el filtro y volver a ver todas las demandas de tu alcance"
            : "Ver solo las demandas de las que sos responsable"
        }
        sx={{
          px: 2,
          py: 0.75,
          borderRadius: 1.5,
          textTransform: "none",
          fontWeight: misDemandas ? 600 : 500,
          color: misDemandas ? "#fff" : institutionalColors.azulPrincipal,
          backgroundColor: misDemandas ? institutionalColors.azulPrincipal : "transparent",
          border: `1px solid ${misDemandas ? institutionalColors.azulPrincipal : rgba.primary(0.15)}`,
          "&:hover": {
            backgroundColor: misDemandas ? institutionalColors.primaryDark : rgba.primaryLight(0.04),
            borderColor: misDemandas ? institutionalColors.primaryDark : institutionalColors.azulClaro,
          },
        }}
      >
        Mis demandas
      </Button>

      {/* Prioridad 2: un jefe zonal filtra por alguien de su equipo. La X de
          limpiar que trae el Autocomplete alcanza para desactivarlo. */}
      {canFilterByResponsable && (
        <Autocomplete
          options={usuarios}
          getOptionLabel={(option) => getUserDisplayName(option)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={usuarios.find((u) => u.id === responsable) ?? null}
          onChange={(_, newValue) => onChange({ mis_demandas: false, responsable: newValue?.id ?? null })}
          loading={isLoadingUsuarios}
          size="small"
          sx={{ width: 240 }}
          renderInput={(params) => (
            <TextField {...params} label="Responsable" placeholder="Buscar usuario..." />
          )}
        />
      )}
    </>
  )
}
