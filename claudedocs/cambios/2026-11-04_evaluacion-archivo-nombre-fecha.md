# Evaluación: el archivo cargado mostraba la URL entera, un "0" y "Invalid Date"

**Rama:** `mejora-evaluacion-archivo-nombre-fecha`  **Fecha:** 2026-11-04

## Problema
En la Evaluación, bajo "Subir el informe firmado", el archivo se veía así:
- recién subido: `prueba.pdf` · `193 B` · **Invalid Date**
- ya guardado (al volver a abrir la evaluación): el nombre era la **URL firmada completa** (`prueba.pdf?X-Amz-Algorithm=...&X-Amz-Signature=...`), el tipo `application/octet-stream`, un **"0"** pegado y **Invalid Date**.

## Causa
En `file-management.tsx`:
1. El nombre se sacaba de la URL con `split('/').pop()`, que arrastra los parámetros de la firma (`?X-Amz-...`). Con ese nombre tampoco se detectaba la extensión (`.pdf?X...`), por eso el tipo salía como `octet-stream`.
2. La fecha se guardaba como texto local (`"4/11/2026, 13:21:06"`) o como `"Archivo existente"`; ninguno se puede formatear como fecha.
3. El tamaño de un archivo ya guardado se pasaba como `0`, y React dibuja un `0` suelto.

El servidor solo manda la URL del archivo (no trae nombre, tamaño ni fecha), así que no hay forma de mostrar esos datos para un archivo ya guardado.

## Qué cambió
- Nuevo `nombreDeArchivoDesdeUrl` en `src/utils/fileUtils.ts`: nombre sin parámetros y decodificado (`informe%20final.pdf` → `informe final.pdf`).
- Los archivos nuevos guardan la fecha en formato ISO (`toISOString()`), que sí se puede formatear.
- Para los archivos ya guardados, tamaño y fecha se pasan como `undefined` y simplemente no se muestran.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/utils/fileUtils.ts` | `nombreDeArchivoDesdeUrl` |
| `src/components/evaluacion/file-management.tsx` | Usa el nombre limpio, fecha ISO y no pasa tamaño/fecha vacíos |
| `tests/unit/file-utils.test.ts` | 2 casos nuevos (firma, decodificación y nombre por defecto) |

## Verificación
Tipos sin errores y tests en verde. En la Evaluación de la demanda #324 el archivo guardado ahora se ve como `prueba.pdf` · `application/pdf`.

## Pendiente (no incluido)
Que el servidor mande `nombre_original`, `tamano` y `fecha_subida` de los adjuntos de la evaluación (como ya hace con los de las intervenciones), para mostrarlos completos. Está anotado para el backend.
