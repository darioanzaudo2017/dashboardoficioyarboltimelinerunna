/**
 * Derivación de permisos del usuario para el workflow.
 * Cuerpo movido tal cual desde `unified-workflow-tab.tsx`; `useUser()` sigue
 * invocándose en el componente (es un hook), acá sólo se calcula sobre `user`.
 */
export const deriveWorkflowPermissions = (user: any) => {
  // Superuser check: is_superuser OR is_staff OR admin/superuser group
  const isSuperuserViaFlag = user?.is_superuser || user?.is_staff || false
  const isSuperuserViaGroup = user?.groups?.some(
    (g: any) => ["superuser", "superusuario", "admin", "administrador", "administrators"].includes(g.name.toLowerCase())
  ) || false
  const isSuperuser = isSuperuserViaFlag || isSuperuserViaGroup
  // Check Director via zonas OR via group membership
  const isDirectorViaZona = user?.zonas?.some((z: any) => z.director) || false
  const isDirectorViaGroup = user?.groups?.some(
    (g: any) => ["director", "directores", "director zona", "director de zona"].includes(g.name.toLowerCase())
  ) || false
  const isDirector = isDirectorViaZona || isDirectorViaGroup
  // userLevel: 3 = Director, 4 = Director Regional/Superior/Superuser
  const userLevel = isSuperuser ? 4 : (isDirector ? 3 : undefined)
  const isJZ = user?.zonas?.some((z: any) => z.jefe) || false
  const isEquipoLegal = user?.groups?.some(
    (g: any) => ["legal", "legales", "equipo legal"].includes(g.name.toLowerCase())
  ) || user?.legal || false

  return { isSuperuser, isDirector, userLevel, isJZ, isEquipoLegal }
}
