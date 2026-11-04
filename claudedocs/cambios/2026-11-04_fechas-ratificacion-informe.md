# Ratificación judicial e informe jurídico: las fechas se veían un día antes

**Rama:** `mejora-fechas-ratificacion-informe`  **Fecha:** 2026-11-04

## Problema
Al registrar la ratificación judicial con fecha de resolución **04/11/2026**, la pantalla de la etapa mostraba "F. Resolución: **03** de noviembre de 2026". Lo mismo podía pasar con la fecha de notificación de la ratificación, con la fecha de notificaciones del informe jurídico y con la fecha de vencimiento del informe de seguimiento.

## Causa
No es por el lugar del servidor. El formulario manda la fecha como `"2026-11-04"` (solo día). Cada pantalla tenía su propia función `formatDate` con `new Date("2026-11-04")`, que el navegador interpreta como medianoche **UTC**; en Argentina (UTC-3) eso es el 03/11 a las 21:00. Es el mismo problema que ya se arregló en la tarjeta de medida ([2026-11-03_fecha-cierre-medida.md](2026-11-03_fecha-cierre-medida.md)), pero en otros tres archivos.

## Qué cambió
Las tres funciones locales usan `toDateObject` (`src/utils/dateUtils.ts`), que ya trata `"AAAA-MM-DD"` como día local. Una fecha con hora real no se toca. `nota-aval-section.tsx` no se cambió porque muestra un instante con hora.

## Archivos
| Archivo | Qué hace |
|---|---|
| `.../components/medida/ratificacion-judicial-section.tsx` | Fecha de resolución y de notificación |
| `.../components/medida/informe-juridico-section.tsx` | Fecha de notificaciones del informe |
| `.../components/medida/completar-informe-modal.tsx` | Fecha de vencimiento del informe de seguimiento |

## Verificación
Tipos sin errores en los tres archivos, 127 tests en verde. En el navegador la ratificación de la MED-2026-253 (resolución cargada el 04/11/2026) ahora muestra "04 de noviembre de 2026".

## Pendiente (no incluido)
La misma función `formatDate` está copiada en otros archivos que muestran fechas con hora (adjuntos, historial de asignaciones); esas no sufren el corrimiento y no se tocaron. La rama `fix/fechas-locales` del repositorio original hace un cambio parecido en todo el front: conviene revisarlas juntas (ver la comparación con el original).
