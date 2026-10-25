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
