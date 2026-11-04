# Detalle de la actividad: la fecha planificada salía un día antes

**Rama:** `mejora-fecha-detalle-actividad`  **Fecha:** 2026-11-04

## Problema
En el detalle de una actividad del plan de trabajo, «Fecha Planificada» mostraba **03 de noviembre de 2026**,
mientras que la tabla y el formulario mostraban el **04/11/2026**.

## Causa
`EditableFields.tsx` armaba la fecha con `new Date("2026-11-04")`. Una fecha sin hora se interpreta como medianoche UTC,
que en Argentina (UTC-3) es la noche del día anterior. Es el mismo desfase ya corregido en otras pantallas
(ver `2026-11-04_fechas-ratificacion-informe.md`).

## Qué cambió
- `EditableFields.tsx`: la fecha se arma con `toDateObject` (`src/utils/dateUtils.ts`), que lee `YYYY-MM-DD` como fecha local.

## Archivos
| Archivo | Qué hace |
|---|---|
| `components/medida/actividad/EditableFields.tsx` | Usa `toDateObject` en `formatFecha` |

## Verificación
Tipos sin errores y tests en verde (151). En pantalla (actividad de la MED-2026-256) el detalle ahora dice «04 de noviembre de 2026», igual que la tabla.
No se agregó test propio: la función de formato está dentro del componente y la lectura de fechas ya está cubierta en `dateUtils`.

## Revisado y sin cambios
Los filtros «fecha desde/hasta» de `useActividadesQuery.ts` también usan `new Date(...)`, pero comparan ambos lados como fecha UTC, así que son consistentes.
