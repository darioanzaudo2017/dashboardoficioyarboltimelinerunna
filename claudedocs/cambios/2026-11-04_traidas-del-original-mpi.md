# Traídas del repositorio original: dos arreglos de la MPI

**Rama:** `traer-original-mpi`  **Fecha:** 2026-11-04

Se trajeron **sin modificarlas** dos ramas del repositorio original (`fosc-hub/NuevoSenafRunna`, autor `santiago6124`, 1/11/2026). Solo se leyó del original; no se le escribió nada. Se verificaron antes con una simulación de merge (sin conflictos con nuestras ramas), tipos sin errores y los tests.

| Rama del original | Qué arregla |
|---|---|
| `fix/codigos-crudos-etiquetas` | La etapa de la MPI mostraba el código interno `PENDIENTE_DE_INFORME_DE_CIERRE`; ahora usa el nombre del catálogo. También muestra la etiqueta de la calificación (en vez del código) en la Mesa de Entradas. |
| `fix/mpi-seguimiento-en-curso` | En la MPI aprobada, el paso «Seguimiento» figuraba «Completado» apenas se aprobaba la intervención, con el plan de trabajo recién empezado. Ahora se completa al registrar el informe de cierre. |

## Verificación
- Tipos sin errores y 143 tests en verde (23 archivos, incluidos los dos tests nuevos del original).
- En pantalla: la MPI `MED-2026-255` ya no muestra el código crudo en la fila de la etapa.
- El cambio del Seguimiento solo se aprecia en una MPI aprobada y todavía abierta; está cubierto por su test (`tests/unit/mpi-steps.test.ts`).

## Efecto en el tutorial
La página «Apertura de MPI» (08b) dice que el Seguimiento queda «Completado» al aprobar; con este cambio pasa a «En curso» hasta el informe de cierre. Pendiente de ajustar el texto.

## Nota
Quedan ~92 ramas más del original sin integrar; ver la comparación hecha el 2026-11-04.
