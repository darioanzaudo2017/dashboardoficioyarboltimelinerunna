# Panel lateral de demandas y legajos: botón "Pantalla completa" visible

**Rama:** `mejora-pantalla-completa`  **Fecha:** 2026-11-03

## Problema
Al hacer clic en una demanda (Mesa de Entradas) o en un legajo (Bandeja de legajos) se abre un panel lateral. Para verlo en una página completa había un **ícono de documento** sin texto, pegado a la X de cerrar: casi nadie lo notaba. Además el panel tenía **dos botones de cerrar** (uno del contenedor y otro del detalle).

## Qué cambió
- El ícono pasa a ser un botón con texto **"Pantalla completa"** (con ícono de expandir y ayuda al pasar el mouse), en el detalle de la demanda y en el del legajo.
- En el panel lateral y en el cajón del móvil, el detalle ya no repite la X de cerrar (queda la del contenedor). En el modal centrado se mantiene.
- Lleva a la misma página de antes (`/demanda/<id>` o `/legajo/<id>`): solo cambia cómo se presenta el botón.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/app/(runna)/demanda/DemandaDetail.tsx` | Botón con texto; prop `ocultarCerrar` |
| `src/app/(runna)/legajo/legajo-detail.tsx` | Igual en el legajo |
| `src/app/(runna)/mesadeentrada/ui/dataGrid/components/DemandaDetailViews.tsx` | Pasa `ocultarCerrar` al panel y al cajón |
| `src/app/(runna)/legajo-mesa/ui/legajos-table/components/LegajoDetailViews.tsx` | Igual para legajos |

## Cómo probarlo
Mesa de Entradas → clic en una demanda: arriba a la derecha del detalle aparece "Pantalla completa". Bandeja de legajos → clic en un legajo: igual. Hay una sola X de cerrar.

## Verificación
Tipos sin errores. Probado en el navegador (admin) con la demanda #332 y el legajo 176.

## Pendiente / notas
- La primera vez que se abre la página completa puede tardar en el servidor de desarrollo (compila la ruta); en producción no ocurre.
- Para el tutorial: conviene tomar las capturas en pantalla completa y explicar el botón en las páginas donde se abre una demanda o un legajo.
