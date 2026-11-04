# Intervención rechazada: el técnico no veía el motivo del rechazo

**Rama:** `mejora-observacion-rechazo-visible`  **Fecha:** 2026-11-04

## Problema
Cuando el Jefe Zonal rechaza una intervención (apertura de MPI/MPE, etc.) y escribe el motivo, el técnico **no lo veía**:
- En el panel de la etapa solo decía "Estado: Pendiente registro intervención".
- La observación existía, pero únicamente al **fondo del paso 3** del modal "Ver/Editar Intervención": había que abrirlo, pasar dos pasos y bajar con scroll.
- Además, el diálogo de rechazo mostraba la etiqueta **"Observaciones \* \*"** (asterisco duplicado).

## Qué cambió
- Nueva función `observacionDeRechazo` (`utils/observacion-rechazo.ts`): devuelve el motivo solo mientras la intervención está de vuelta en manos del técnico (`RECHAZADO` o `BORRADOR` después del rechazo). Si ya se reenvió o se aprobó, la observación vieja no se muestra.
- Nuevo aviso `RechazoObservacionAlert` ("El Jefe Zonal rechazó la intervención" + el motivo), usado en:
  - la tarjeta de la etapa (`apertura-section.tsx`), arriba de los botones;
  - el modal de intervención, arriba de **cada paso** (`IntervencionModal.tsx`).
- En el paso 3 se conserva el aviso del fondo solo cuando el de arriba no aparece (para no duplicarlo).
- Etiqueta del diálogo de rechazo: `"Observaciones *"` → `"Observaciones"` (el campo ya agrega su propio asterisco por ser obligatorio).

## Archivos
| Archivo | Qué hace |
|---|---|
| `utils/observacion-rechazo.ts` | Decide cuándo corresponde mostrar la observación |
| `components/medida/shared/rechazo-observacion-alert.tsx` | Aviso reutilizable |
| `components/medida/apertura-section.tsx` | Aviso en la tarjeta de la etapa |
| `components/medida/shared/intervencion-modal/IntervencionModal.tsx` | Aviso arriba de cada paso; etiqueta sin asterisco duplicado |
| `.../steps/documentos/ConfiguracionAdicionalSection.tsx` | Evita duplicar el aviso en el paso 3 |
| `tests/unit/observacion-rechazo.test.ts` | 4 casos (rechazada, borrador, reenviada/aprobada, vacía) |

## Verificación
Tipos sin errores; 24 archivos / 147 tests en verde. En pantalla (MPI MED-2026-256, rechazada y guardada como borrador) el aviso aparece en la tarjeta de la etapa y en el paso 1 del modal.
La etiqueta sin asterisco duplicado no se volvió a ver en pantalla (hace falta otro rechazo para abrir el diálogo).
