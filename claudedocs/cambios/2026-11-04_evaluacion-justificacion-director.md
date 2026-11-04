# Evaluación: la justificación del director se pide antes de autorizar o no autorizar

**Rama:** `mejora-evaluacion-justificacion-director`  **Fecha:** 2026-11-04

## Problema
Al hacer clic en "Autorizar" (y confirmar), el servidor rechaza la decisión del Director:

> No se pudo autorizar la solicitud: • El campo justificacion_director es obligatorio.

El campo "Justificación del Director" solo existía dentro de "Justificaciones internas", que **se muestra únicamente cuando el Director no autorizó**. Es el mismo problema que ya tenía la justificación del técnico: no había dónde escribirla y la autorización no se podía dar en el flujo normal. Se vio al recorrer el tutorial con la demanda #333.

## Qué cambió
- Cuando hay una solicitud del técnico y quien mira puede decidir (Director o administrador), aparece el bloque **"Justificación del director"** (obligatoria, de uso interno, no va al informe).
- Los botones **Autorizar** y **No autorizar** se habilitan solo cuando está completa, y debajo dice «Falta: completar la justificación del director».
- Si el Director ya no autorizó, la justificación se sigue editando dentro de "Justificaciones internas", como antes.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/evaluacion/evaluacion-tabs.tsx` | Bloque visible de la justificación del director |
| `src/components/evaluacion/action-buttons.tsx` | Deshabilita los botones y muestra qué falta |

## Cómo probarlo
Demanda en "Pendiente Autorización" con solicitud del técnico (por ejemplo la #333): el bloque aparece; con el campo vacío los botones están deshabilitados; al completarlo, "Autorizar" → confirmación → la demanda pasa a Admitida y se crea el legajo con su medida.

## Verificación
Tipos sin errores. Probado en el navegador (admin) con la demanda #333: se autorizó (PUT `evaluaciones/333/autorizar/` → 200) y se creó `LEG-2026-0179` con una MPE vigente.

## Pendiente / notas
- Conviene que el backend confirme que ambas justificaciones deben ser obligatorias desde el primer pedido.
- Hay que reflejarlo en el tutorial (páginas 04 y 05).
