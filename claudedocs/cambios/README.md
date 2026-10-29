# Cambios por rama

Cada mejora se entrega en **una rama chica, con su propio documento** en esta carpeta.
Así se puede revisar, probar y mergear (o descartar) de a una.

## Convención

| Qué | Cómo |
|---|---|
| Rama | `mejora-<tema-corto>` (ej. `mejora-aviso-coincidencias`), siempre a partir de `main` |
| Documento | `claudedocs/cambios/AAAA-MM-DD_<tema-corto>.md`, en el mismo commit que el código |
| Alcance | Un solo tema por rama. Si aparece otro, va en otra rama |
| Tests | Lo que se pueda probar sin navegador lleva test en `tests/unit/` |
| Verificación | Se prueba en el navegador y se anota qué se vio |
| Backend | Lo que no se arregla desde el front **no** se parchea: va a `OBSERVACIONES_BACKEND_*.md` |

## Plantilla del documento

```md
# <Título del cambio>

**Rama:** `mejora-...`  **Fecha:** AAAA-MM-DD

## Problema
Qué pasaba antes y a quién le molestaba.

## Qué cambió
Lista corta de cambios visibles para el usuario.

## Archivos
| Archivo | Qué hace |

## Cómo probarlo
Pasos concretos para ver el cambio.

## Verificación
Tests, tipos y qué se comprobó en el navegador.

## Pendiente / notas
Límites conocidos, dependencias del backend, ideas siguientes.
```

## Índice

| Fecha | Rama | Tema |
|---|---|---|
| 2026-10-23 | `mejoras-ux-front` | Registro de demanda y asignación (errores, navegación, mensajes) — ver [OBSERVACIONES_BACKEND_2026-10-23.md](../OBSERVACIONES_BACKEND_2026-10-23.md) |
| 2026-10-25 | `mejora-aviso-coincidencias` | Aviso de posibles coincidencias: compacto, abajo a la derecha, con alerta y animación — [documento](2026-10-25_aviso-coincidencias.md) |
| 2026-10-25 | `mejora-borrador-paso` | El borrador del registro vuelve al paso donde se estaba — [documento](2026-10-25_borrador-paso.md) |
| 2026-10-25 | `mejora-constatacion-textos` | Nombres con tildes y textos en español en Constatación — [documento](2026-10-25_constatacion-textos.md) |
| 2026-10-25 | `mejora-constatacion-feedback` | Avisos que se perdían (contenedor duplicado) y confirmaciones — [documento](2026-10-25_constatacion-feedback.md) |
| 2026-10-27 | `mejora-constatacion-evaluacion` | Contadores en las pestañas y botón "Enviar a Evaluación" a la vista — [documento](2026-10-27_constatacion-evaluacion.md) |
| 2026-10-27 | `mejora-navegacion-evaluacion` | La fila de una demanda en evaluación ofrece "Ver constatación" o "Ir a la evaluación" — [documento](2026-10-27_navegacion-evaluacion.md) |
| 2026-10-27 | `mejora-evaluacion-cierre` | Panel de 3 pasos en Evaluación (borrador, informe firmado, solicitud) con confirmaciones — [documento](2026-10-27_evaluacion-cierre.md) |
| 2026-10-27 | `mejora-evaluacion-errores-firmantes` | Motivo del error del servidor en Evaluación y bucle de firmantes corregido — [documento](2026-10-27_evaluacion-errores-firmantes.md) |
| 2026-10-29 | `mejora-evaluacion-chequeo-legajo` | Aviso de legajo y medidas vigentes antes de pedir o autorizar una medida — [documento](2026-10-29_evaluacion-chequeo-legajo.md) |

## Orden recomendado para unir las ramas

Unir **de a una**, en este orden, probando en pantalla y con `npx vitest run` entre medio.
Usar **"Create a merge commit"** (no squash ni rebase): `mejora-evaluacion-chequeo-legajo` sale de `mejora-evaluacion-cierre`
y GitHub debe conservar esa relación. Los dos conflictos conocidos están marcados en la tabla y ya vienen resueltos en la rama `integracion`.

| # | Rama | Notas |
|---|---|---|
| 1 | `mejora-constatacion-textos` | Base de los textos en español. |
| 2 | `mejora-constatacion-feedback` | **Conflicto en `EnviarRespuestaModal.tsx`** (imports de `demandaGridLocaleText` y `ConfirmDialog`): conservar los dos. Trae `ConfirmDialog.tsx`. |
| 3 | `mejora-constatacion-evaluacion` | Usa el mismo `ConfirmDialog` (idéntico a propósito). Toca `DemandaDetail.tsx`. |
| 4 | `mejora-aviso-coincidencias` | Independiente. |
| 5 | `mejora-borrador-paso` | Toca `MultiStepForm.tsx`. |
| 6 | `mejora-navegacion-evaluacion` | Toca `DemandaDetail.tsx` y `DemandaTableContent.tsx`. |
| 7 | `mejora-evaluacion-cierre` | Debe ir antes que la 9. |
| 8 | `mejora-evaluacion-errores-firmantes` | Toca `action-buttons.tsx` y `apiErrorFormatter.ts`. |
| 9 | `mejora-evaluacion-chequeo-legajo` | **Conflicto en los imports de `action-buttons.tsx`**: conservar los dos lados. Depende de la 7. |

La rama **`integracion`** ya tiene las 9 unidas en este orden (merge commits, tipos sin errores, 59 tests pasando).

## Para el equipo de backend

- [OBSERVACIONES_BACKEND_2026-10-23.md](../OBSERVACIONES_BACKEND_2026-10-23.md): problemas B1 a B11 (registro de demanda y asignación).
- [PEDIDO_VALIDACION_BACKEND_2026-10-29.md](../PEDIDO_VALIDACION_BACKEND_2026-10-29.md): B12 a B17 (DNI duplicado, legajo por DNI, medida vigente,
  estado de la demanda, justificaciones obligatorias). Decisiones pendientes del cliente: bloquear o solo avisar.
