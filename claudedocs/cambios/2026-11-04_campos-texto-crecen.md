# Intervención: los campos de texto largos no se agrandaban al escribir

**Rama:** `mejora-campos-texto-crecen`  **Fecha:** 2026-11-04

## Problema
En el paso «Detalles de la intervención», «Intervención específica», «Descripción detallada» y «Motivo de vulneraciones»
(o «Motivo de Cese») eran de **una sola línea fija** (`rows={1}`) y además van en tres columnas angostas.
Al escribir un texto largo, solo se veía la última línea y no se podía revisar lo escrito.

## Qué cambió
`StepDetalles.tsx`: los tres campos pasan de `rows={1}` a `minRows={2}` + `maxRows={12}`:
- arrancan con 2 líneas;
- crecen a medida que se escribe;
- pasan a scroll interno recién cerca de las 12 líneas (para que el modal no se vuelva inmanejable).

## Archivos
| Archivo | Qué hace |
|---|---|
| `components/medida/shared/intervencion-modal/steps/StepDetalles.tsx` | `minRows`/`maxRows` en los tres campos |

## Verificación
Tipos sin errores. En pantalla (MPI MED-2026-229) los tres campos miden 2 líneas y ya no llevan el alto fijo; la «Intervención específica» cargada ocupa sus dos líneas completas.
**No se vio crecer escribiendo**: esa intervención ya estaba aprobada y los campos quedan bloqueados. El crecimiento es el comportamiento estándar de MUI con `minRows`/`maxRows`.

## Pendiente (no incluido)
Hay unos 80 cuadros de texto más en la app con alto fijo (`rows={2..6}`, en 59 archivos: motivos, observaciones, comentarios, etc.).
Pasarlos al mismo criterio es un cambio mecánico, pero toca muchos archivos y puede chocar con ramas del repositorio original; queda para una rama aparte si se decide.
