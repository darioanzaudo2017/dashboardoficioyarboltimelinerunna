# Fecha de cierre de la medida: se veía un día antes

**Rama:** `mejora-fecha-cierre-medida`  **Fecha:** 2026-11-03

## Problema
En la tarjeta de medida del legajo, la MED-2026-252 decía "Apertura 03/11/2026 · Cierre 02/11/2026" (cierre un día **antes** de la apertura).

## Causa
No es por el lugar del servidor. El back manda `fecha_cierre` como `"2026-11-03T00:00:00Z"` (una fecha de calendario guardada como medianoche UTC). El navegador la convierte a la hora local (Argentina, UTC-3) y queda el 02/11 a las 21:00, por eso mostraba el día anterior. Con `fecha_apertura` no pasa porque trae una hora real (`...T15:56:03Z`).

## Qué cambió
- `toDateObject` (`src/utils/dateUtils.ts`) ahora trata también `"AAAA-MM-DDT00:00:00Z"` como fecha de calendario, igual que `"AAAA-MM-DD"`. Una hora real no se toca.
- La tarjeta de medida, el selector de medidas del plan de trabajo y el historial de etapas usan `formatDateLocaleAR` en vez de `new Date(...)`.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/utils/dateUtils.ts` | Reconoce la medianoche UTC como fecha de calendario |
| `.../components/legajo/medida-resumen-card.tsx` | Formato de fechas de la tarjeta |
| `.../components/legajo/plan-trabajo-section.tsx` | Fecha de apertura en el selector |
| `.../unified-workflow-tab/parts/EtapaHistorialSelector.tsx` | Fecha de inicio de la etapa |
| `tests/unit/fecha-cierre-medida.test.ts` | 5 casos |

## Verificación
Tipos sin errores, 120 tests en verde. En el navegador la MED-2026-252 muestra "Cierre 03/11/2026".

## Pendiente / notas
- Recomendación para el back: mandar las fechas de calendario como `"AAAA-MM-DD"` (campo date) en vez de datetime a medianoche UTC; así ningún cliente se confunde.
- Hay otros lugares que hacen `new Date(fecha).toLocaleDateString(...)` (ej. `PersonasRelacionadasSection`, `VinculacionNotificacion`); con fechas que traen hora real no fallan, pero conviene pasarlos a `formatDateLocaleAR` si algún campo llega solo con fecha.
