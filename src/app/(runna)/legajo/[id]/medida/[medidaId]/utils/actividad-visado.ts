interface ConfigVisado {
  requiere_visado_legales?: boolean | null
}

interface ActividadConConfigVisado {
  subtipo_actividad_info?: ConfigVisado | null
  tipo_actividad_info?: ConfigVisado | null
}

/**
 * Si al completar la actividad pasa al circuito de visado (Jefe Zonal y Legales).
 * Lo decide el subtipo: el servidor no hereda el tilde del tipo (una actividad de Equipo Técnico cuyo tipo
 * tiene el visado tildado, pero su subtipo no, se completa directo). El tipo solo se mira si la actividad
 * no trae subtipo.
 */
export const actividadRequiereVisado = (actividad?: ActividadConConfigVisado | null): boolean => {
  if (!actividad) return false
  if (actividad.subtipo_actividad_info) return !!actividad.subtipo_actividad_info.requiere_visado_legales
  return !!actividad.tipo_actividad_info?.requiere_visado_legales
}
