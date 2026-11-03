# Actividades: fecha un día corrida y contadores del encabezado desactualizados

**Rama:** `mejora-actividades-fecha-contadores`  **Fecha:** 2026-11-03

## Problema
Probando "Agregar actividad" en una medida MPE (paso 9 del tutorial):
1. La tabla mostraba la fecha planificada **un día antes**: el servidor devuelve `2026-11-03` y la tabla decía "02 nov 2026".
   `formatDate` armaba la fecha con `new Date("2026-11-03")`, que se interpreta en hora UTC y en Argentina cae al día anterior.
2. Los **contadores y la barra de progreso del encabezado** de la medida no se actualizaban al crear o cambiar una actividad
   (con 2 actividades en la tabla seguía diciendo "0 de 1 actividades completadas"). Solo se corregían al recargar la página.

## Qué cambió
- `formatDate` de la tabla usa el mismo criterio que `formatDateLocaleAR` (día de calendario, hora local). Se exportó `toDateObject` de `dateUtils`.
- El formulario de **edición** de actividad también abría con la fecha del día anterior (`new Date(actividad.fecha_planificacion)`); ahora usa `toDateObject`.
- Al refrescar la tabla de una medida (crear, editar, cambiar estado, asignar) también se refrescan las demás consultas de actividades del plan,
  que son las que alimentan el encabezado (`actividades-plan*`).

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/utils/dateUtils.ts` | Exporta `toDateObject` |
| `.../UnifiedActividadesTable/utils.ts` | `formatDate` sin corrimiento de día |
| `.../UnifiedActividadesTable/UnifiedActividadesTable.tsx` | `handleRefresh` refresca también el encabezado |
| `.../components/medida/EditActividadModal.tsx` | Fecha de planificación sin corrimiento al editar |
| `tests/unit/actividades-format-date.test.ts` | 2 casos |

## Cómo probarlo
1. `/legajo/176/medida/249`: la fecha de la actividad creada hoy debe decir la fecha de hoy (no el día anterior).
2. "Agregar actividad" y guardar: los contadores y el "X de N actividades completadas" del encabezado suben en el acto, sin recargar.
3. Editar una actividad: la fecha de planificación del formulario coincide con la de la tabla.

## Verificación
Tipos sin errores y tests en verde. En el navegador (admin, MED-2026-249): la fecha pasó de "02 nov" a "03 nov" y, al crear una actividad,
el encabezado pasó de "0 de 2" a "0 de 3" junto con la tabla. La edición no se probó en pantalla.

## Pendiente / notas
- Quedan otros `new Date("AAAA-MM-DD")` en el proyecto (filtros "fecha desde/hasta" de actividades, ordenamientos). Los filtros comparan ambos lados en UTC y no se corren;
  no se tocaron.
- Los estados de visado JZ y Legal dependen de cómo esté configurada cada actividad en la base (circuito de oficios judiciales); no es un problema del front.
