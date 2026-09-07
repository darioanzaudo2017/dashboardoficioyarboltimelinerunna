import { useMemo } from 'react'
import { useCatalogData, extractArray } from '@/hooks/useApiQuery'
import type { TTipoActividad, TTipoOficio } from '../../../../[id]/medida/[medidaId]/types/actividades'
import type { Usuario, Zona } from '@/app/(runna)/legajo-mesa/types/asignacion-types'

/**
 * Catálogos del panel de filtros. Movido tal cual desde el componente original
 * (líneas 162-184), en el mismo orden de invocación.
 */
export const useFilterCatalogs = () => {
  // Fetch catalog data
  const { data: usuariosData, isLoading: isLoadingUsuarios } = useCatalogData<Usuario[]>('users/')
  const usuarios = extractArray(usuariosData)

  const { data: tiposActividadData, isLoading: isLoadingTipos } = useCatalogData<TTipoActividad[]>(
    'tipos-actividad-plan-trabajo/?activo=true&page_size=500'
  )
  const tiposActividad = extractArray(tiposActividadData)

  const { data: zonasData, isLoading: isLoadingZonas } = useCatalogData<Zona[]>('zonas/')
  const zonas = extractArray(zonasData)

  const { data: tiposOficioData, isLoading: isLoadingTiposOficio } = useCatalogData<TTipoOficio[]>(
    'tipos-oficio/?activo=true&page_size=500'
  )
  const tiposOficio = extractArray(tiposOficioData)
  const categoriasOficio = useMemo(() => {
    const unicas = new Map<number, { id: number; nombre: string }>()
    tiposOficio.forEach((tipo) => {
      if (tipo.categoria) unicas.set(tipo.categoria.id, tipo.categoria)
    })
    return Array.from(unicas.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [tiposOficio])

  return {
    usuarios, isLoadingUsuarios,
    tiposActividad, isLoadingTipos,
    zonas, isLoadingZonas,
    tiposOficio, isLoadingTiposOficio,
    categoriasOficio,
  }
}
